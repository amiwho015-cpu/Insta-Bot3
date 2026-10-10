"use strict";
/**
 * api.unsendMessage / api.editMessage that work on Instagram for GoatBot-style
 * commands. Safe to call more than once per api object.
 */
const THREADS = new Map(); // messageID -> threadID of bot messages
const MAX = 5000;

function remember(messageID, threadID) {
	if (messageID == null || threadID == null) return;
	THREADS.set(String(messageID), String(threadID));
	if (THREADS.size > MAX) THREADS.delete(THREADS.keys().next().value);
}

function attempt(fn, args, timeoutMs) {
	return new Promise((resolve, reject) => {
		let done = false;
		const finish = (error, result) => {
			if (done) return;
			done = true;
			clearTimeout(timer);
			error ? reject(error) : resolve(result);
		};
		const timer = setTimeout(() => finish(new Error("unsend timed out")), timeoutMs || 8000);
		try {
			const ret = fn(...args, finish);
			if (ret && typeof ret.then === "function") ret.then(r => finish(null, r), e => finish(e));
		}
		catch (error) { finish(error); }
	});
}


/** names of functions on the client that look like "remove a message" (safe ones only) */
function unsendLikeMethods(api) {
	const names = new Set();
	let o = api;
	while (o && o !== Object.prototype) {
		for (const n of Object.getOwnPropertyNames(o)) names.add(n);
		o = Object.getPrototypeOf(o);
	}
	return [...names].filter(n => { try { return typeof api[n] === "function" && /^(unsend|retract|removeMessage|deleteMessage|removeItem|deleteItem)/i.test(n); } catch (_) { return false; } });
}
function apiMethodHints(api) {
	const names = new Set();
	let o = api;
	while (o && o !== Object.prototype) {
		for (const n of Object.getOwnPropertyNames(o)) names.add(n);
		o = Object.getPrototypeOf(o);
	}
	return [...names].filter(n => { try { return typeof api[n] === "function" && /unsend|delet|remov|retract/i.test(n); } catch (_) { return false; } });
}

module.exports = function installApiCompat(api) {
	if (!api || api.__igCompatInstalled) return api;
	api.__igCompatInstalled = true;

	// -- track bot message -> thread (wraps whatever sendMessage is installed now)
	const originalSend = typeof api.sendMessage === "function" ? api.sendMessage.bind(api) : null;
	if (originalSend) {
		api.sendMessage = function (form, threadID, ...rest) {
			// GoatBot signature is (form, threadID, callback, replyToMessageID). Many commands
			// pass the messageID as the 3rd argument; the Instagram client then returns null
			// instead of the sent message. Move such a value to the 4th (reply) position.
			if (rest.length && rest[0] != null && typeof rest[0] !== "function") {
				const cb = typeof rest[1] === "function" ? rest[1] : undefined;
				rest = [cb, rest[0]];
			}
			const result = originalSend(form, threadID, ...rest);
			if (result && typeof result.then === "function") {
				result.then(res => { if (res && res.messageID) remember(res.messageID, (res.threadID != null ? res.threadID : threadID)); }).catch(() => { });
			}
			return result;
		};
	}

	const rawUnsend = typeof api.unsendMessage === "function" ? api.unsendMessage.bind(api) : null;

	api.__rawUnsend = rawUnsend;
	api.unsendMessage = async function unsendMessage(messageID, ...rest) {
		if (!rawUnsend) throw new Error("unsendMessage is not available");
		const callback = [...rest].reverse().find(a => typeof a === "function");
		const given = rest.find(a => typeof a === "string" || typeof a === "number");
		const threadID = given != null ? String(given) : THREADS.get(String(messageID));

		const forms = [];
		if (threadID != null) {
			forms.push([String(messageID), threadID]);   // (messageID, threadID, cb)
			forms.push([threadID, String(messageID)]);   // (threadID, messageID, cb)
		}
		forms.push([String(messageID)]);                   // (messageID, cb)

		const errors = [];
		for (const args of forms) {
			try {
				const result = await attempt(rawUnsend, args);
				if (typeof callback === "function") callback(null, result);
				return result;
			}
			catch (error) {
				const text = error && (error.message || error.error || (typeof error === "string" ? error : JSON.stringify(error)));
				errors.push(`(${args.length} args) ${String(text).slice(0, 160)}`);
			}
		}
		// last resort: other unsend-like methods the Instagram client may expose
		for (const name of unsendLikeMethods(api)) {
			if (name === "unsendMessage") continue;
			const fn = api[name].bind(api);
			const combos = threadID != null ? [[String(messageID), threadID], [threadID, String(messageID)]] : [[String(messageID)]];
			for (const args of combos) {
				try {
					const result = await attempt(fn, args);
					if (typeof callback === "function") callback(null, result);
					return result;
				}
				catch (error) {
					errors.push(`${name}: ${String((error && error.message) || error).slice(0, 120)}`);
				}
			}
		}
		console.log(`[unsend-fail] message=${messageID} thread=${threadID} :: ${errors.join(" | ") || "no error text"}`);
		const lastError = new Error(errors.join(" | ") || "unsend failed");
		lastError.attempts = errors;
		if (typeof callback === "function") { callback(lastError); return; }
		throw lastError;
	};

	// -- editMessage: use the native one when it works, else unsend + resend
	const rawEdit = typeof api.editMessage === "function" ? api.editMessage.bind(api) : null;
	api.editMessage = async function editMessage(text, messageID, ...rest) {
		const callback = [...rest].reverse().find(a => typeof a === "function");
		const given = rest.find(a => typeof a === "string" || typeof a === "number");
		const threadID = given != null ? String(given) : THREADS.get(String(messageID));
		const done = (error, result) => {
			if (typeof callback === "function") return callback(error, result);
			if (error) throw error;
			return result;
		};
		if (rawEdit) {
			try { return done(null, await attempt(rawEdit, [text, String(messageID)], 12000)); }
			catch (_) { /* fall through to unsend + resend */ }
		}
		if (threadID == null) return done(new Error("editMessage: unknown thread for message " + messageID));
		try { await api.unsendMessage(messageID, threadID); } catch (_) { /* old message may be gone */ }
		try {
			const sent = await new Promise((resolve, reject) => {
				let finished = false;
				const fin = (e, r) => { if (finished) return; finished = true; e ? reject(e) : resolve(r); };
				const ret = api.sendMessage(typeof text === "string" ? text : (text && text.body) || "", threadID, fin);
				if (ret && typeof ret.then === "function") ret.then(r => fin(null, r), e => fin(e));
			});
			return done(null, sent);
		}
		catch (error) { return done(error); }
	};

	return api;
};
module.exports.remember = remember;
module.exports.apiMethodHints = apiMethodHints;
