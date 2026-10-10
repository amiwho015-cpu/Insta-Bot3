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
		const timer = setTimeout(() => finish(new Error("unsend timed out")), timeoutMs || 12000);
		try {
			const ret = fn(...args, finish);
			if (ret && typeof ret.then === "function") ret.then(r => finish(null, r), e => finish(e));
		}
		catch (error) { finish(error); }
	});
}

module.exports = function installApiCompat(api) {
	if (!api || api.__igCompatInstalled) return api;
	api.__igCompatInstalled = true;

	// -- track bot message -> thread (wraps whatever sendMessage is installed now)
	const originalSend = typeof api.sendMessage === "function" ? api.sendMessage.bind(api) : null;
	if (originalSend) {
		api.sendMessage = function (form, threadID, ...rest) {
			const result = originalSend(form, threadID, ...rest);
			if (result && typeof result.then === "function") {
				result.then(res => { if (res && res.messageID) remember(res.messageID, (res.threadID != null ? res.threadID : threadID)); }).catch(() => { });
			}
			return result;
		};
	}

	const rawUnsend = typeof api.unsendMessage === "function" ? api.unsendMessage.bind(api) : null;

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

		let lastError;
		for (const args of forms) {
			try {
				const result = await attempt(rawUnsend, args);
				if (typeof callback === "function") callback(null, result);
				return result;
			}
			catch (error) { lastError = error; }
		}
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
