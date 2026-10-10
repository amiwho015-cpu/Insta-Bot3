"use strict";

/**
 * unsent — no-prefix shortcut. Reply to a bot message with "u", "un", "uns",
 * "r", "unsend" or "unsent" and the bot removes it.
 * v4: no sender-id gate (its format mismatch made it silently do nothing),
 * tries every id the reply carries, and logs why it failed.
 */
const TRIGGERS = ["unsent", "unsend", "u", "uns", "un", "r"];

function replyIds(reply) {
	const ids = [reply.messageID, reply.id, reply.itemID, reply.item_id, reply.mid]
		.filter(v => v != null && v !== "")
		.map(String);
	return [...new Set(ids)];
}

async function run({ api, event }) {
	const reply = event.messageReply;
	if (!reply)
		return false;
	const ids = replyIds(reply);
	if (!ids.length)
		return false;

	let lastError;
	for (const id of ids) {
		try {
			await api.unsendMessage(id, event.threadID);
			return true;
		}
		catch (err) {
			lastError = err;
		}
	}
	console.log("[unsent] could not unsend", ids.join(","), "-", lastError && (lastError.message || lastError));
	return false;
}

module.exports = {
	config: {
		name: "unsent",
		aliases: ["un", "r", "u"],
		version: "4.0",
		author: "CRX Shihab",
		countDown: 1,
		role: 0,
		description: { en: "Unsend the bot's message (reply with u / un / r)" },
		category: "utility",
		guide: { en: "Reply to a bot message with u, un, r or {pn}" }
	},

	onChat: async function ({ api, event }) {
		const body = String(event.body || "").trim().toLowerCase();
		if (!TRIGGERS.includes(body))
			return;
		return run({ api, event });
	},

	onStart: async function ({ api, event, message }) {
		if (!event.messageReply)
			return message.reply("Please reply to the message you want to unsend.");
		const ok = await run({ api, event });
		if (!ok)
			return message.reply("Could not unsend that message (only the bot's own messages can be removed).");
	}
};
