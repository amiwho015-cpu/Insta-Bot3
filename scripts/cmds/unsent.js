"use strict";

/**
 * unsent — no-prefix shortcut. Reply to a bot message with "u", "un", "uns",
 * "r", "unsend" or "unsent" and the bot removes it.
 * v5: on failure, bot admins get the real reason in chat (for debugging).
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
		return { ok: false, why: "no messageReply on this event" };
	const ids = replyIds(reply);
	if (!ids.length)
		return { ok: false, why: "replied message has no id; keys: " + Object.keys(reply).join(",") };

	const problems = [];
	for (const id of ids) {
		try {
			await api.unsendMessage(id, event.threadID);
			return { ok: true };
		}
		catch (err) {
			problems.push(`id ${id}: ${(err && err.message) || err}`);
		}
	}
	const why = problems.join("\n").slice(0, 700)
		+ `\nthread: ${event.threadID}\nreply.senderID: ${reply.senderID}\nbot: ${api.getCurrentUserID && api.getCurrentUserID()}`
		+ `\nreply keys: ${Object.keys(reply).join(",")}`
		+ `\nclient methods: ${require("../../func/igcompat/apiCompat.js").apiMethodHints(api).join(",") || "none"}`;
	console.log("[unsent] failed:", why);
	return { ok: false, why };
}

module.exports = {
	config: {
		name: "unsent",
		aliases: ["un", "r", "u"],
		version: "5.0",
		author: "CRX Shihab",
		countDown: 1,
		role: 0,
		description: { en: "Unsend the bot's message (reply with u / un / r)" },
		category: "utility",
		guide: { en: "Reply to a bot message with u, un, r or {pn}" }
	},

	onChat: async function ({ api, event, message, role }) {
		const body = String(event.body || "").trim().toLowerCase();
		if (!TRIGGERS.includes(body))
			return;
		const res = await run({ api, event });
		if (!res.ok && role >= 2)
			return message.reply("❌ unsend failed:\n" + res.why);
	},

	onStart: async function ({ api, event, message }) {
		if (!event.messageReply)
			return message.reply("Please reply to the message you want to unsend.");
		const res = await run({ api, event });
		if (!res.ok)
			return message.reply("❌ unsend failed:\n" + res.why);
	}
};
