"use strict";

/**
 * libsrc — admin-only diagnostic. Prints the Instagram client's unsend source
 * into the chat and runs a live unsend test, so the exact fix can be made.
 */
const fs = require("fs");
const path = require("path");

function chunks(text, size = 900) {
	const out = [];
	for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
	return out;
}

function tryRaw(raw, args, ms) {
	return new Promise(resolve => {
		const started = Date.now();
		let done = false;
		const finish = (error, result) => {
			if (done) return;
			done = true;
			clearTimeout(timer);
			const took = Date.now() - started;
			resolve(error ? `ERR ${String((error && error.message) || error).slice(0, 120)} (${took}ms)` : `OK ${JSON.stringify(result || null).slice(0, 80)} (${took}ms)`);
		};
		const timer = setTimeout(() => finish(new Error("TIMEOUT no answer")), ms);
		try {
			const ret = raw(...args, finish);
			if (ret && typeof ret.then === "function") ret.then(r => finish(null, r), e => finish(e));
		}
		catch (e) { finish(e); }
	});
}

module.exports = {
	config: {
		name: "libsrc",
		version: "1.0",
		author: "diag",
		countDown: 5,
		role: 2,
		description: { en: "Diagnostic: show unsend source + live unsend test (admin only)" },
		category: "owner",
		guide: { en: "{pn}" }
	},

	onStart: async function ({ api, event }) {
		const threadID = event.threadID;
		const say = text => api.sendMessage(String(text), threadID);

		// 1) library source
		let dir = null, version = "?";
		try {
			const pj = require.resolve("@lazyneoaz/ig-chat-api/package.json");
			dir = path.dirname(pj);
			version = require(pj).version;
		}
		catch (e) { await say("could not locate @lazyneoaz/ig-chat-api: " + e.message); }
		await say(`lib version: ${version}\nunsend fn: ${typeof api.__rawUnsend}`);
		if (dir) {
			for (const f of ["lib/methods/unsendMessage.js", "lib/methods/deleteMessage.js"]) {
				let text;
				try { text = fs.readFileSync(path.join(dir, f), "utf8"); }
				catch (e) { text = "(cannot read) " + e.message; }
				const parts = chunks(`FILE ${f}\n` + text);
				for (const part of parts) await say(part);
			}
		}

		// 2) live test on a message the bot just sent
		const raw = api.__rawUnsend;
		if (typeof raw !== "function") return say("raw unsend function not found");
		let sent;
		try { sent = await api.sendMessage("unsend test message", threadID); }
		catch (e) { return say("test send failed: " + e.message); }
		const id = sent && sent.messageID;
		if (!id) return say("test send gave no messageID: " + JSON.stringify(sent));
		const lines = [`test id: ${id}\nthread: ${threadID}`];
		const forms = [[String(id), String(threadID)], [String(threadID), String(id)], [String(id)]];
		for (const args of forms) {
			const res = await tryRaw(raw, args, 8000);
			lines.push(`(${args.map((_, i) => (i === 0 && args.length === 2 && args[0] === String(threadID) ? "thread" : "id/thread")).join(",")}) ${args.length} args -> ${res}`);
			if (res.startsWith("OK")) break;
		}
		return say(lines.join("\n"));
	}
};
