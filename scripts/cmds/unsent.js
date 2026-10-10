"use strict";

/**
 * unsent — no-prefix shortcut. Reply to a bot message with "u", "un", "r" or
 * "unsent" and the bot removes it. (From InstaBOT.)
 */
const TRIGGERS = ["unsent", "u", "uns", "un", "r"];

async function run({ api, event }) {
	const reply = event.messageReply;
	if (!reply || !reply.messageID) return;
	if (String(reply.senderID) !== String(api.getCurrentUserID())) return;
	try {
		await api.unsendMessage(reply.messageID, event.threadID);
	}
	catch (_) { /* nothing more to do */ }
}

module.exports = {
	config: {
		name: "unsent",
		aliases: ["un", "r"],
		version: "3.5",
		author: "CRX Shihab",
		countDown: 1,
		role: 0,
		description: { en: "Unsend the bot's message (reply with u / un / r)" },
		category: "utility",
		guide: { en: "Reply to a bot message with u, un, r or {pn}" }
	},

	onChat: async function ({ api, event }) {
		const body = String(event.body || "").trim().toLowerCase();
		if (!TRIGGERS.includes(body)) return;
		return run({ api, event });
	},

	onStart: async function ({ api, event }) {
		return run({ api, event });
	}
};
