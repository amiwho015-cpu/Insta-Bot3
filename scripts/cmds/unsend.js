"use strict";

/**
 * unsend — reply to a message the bot sent and the bot removes it.
 * Replaces the old GoatBot unsend, which never passed the thread id that
 * Instagram needs. This version is the InstaBOT one: it sends the thread id
 * and does not rely on a sender-id comparison.
 */
module.exports = {
	config: {
		name: "unsend",
		aliases: ["uns", "unsendmsg"],
		version: "2.0",
		author: "Neoaz 🐊",
		countDown: 1,
		role: 0,
		description: {
			en: "Unsend a message: reply to any bot message and the bot removes it"
		},
		category: "utility",
		guide: {
			en: "Reply to a message with {pn}"
		}
	},

	langs: {
		en: {
			syntaxError: "Please reply to the message you want to unsend.",
			failed: "Could not unsend that message (only the bot's own messages can be removed)."
		}
	},

	onStart: async function ({ api, event, message, getLang }) {
		const replied = event.messageReply;
		if (!replied)
			return message.reply(getLang("syntaxError"));

		const ids = [...new Set([replied.messageID, replied.id, replied.itemID, replied.item_id, replied.mid]
			.filter(v => v != null && v !== "").map(String))];
		if (!ids.length)
			return message.reply(getLang("syntaxError"));

		let lastError;
		for (const id of ids) {
			try {
				await api.unsendMessage(id, event.threadID);
				return;
			}
			catch (err) {
				lastError = err;
			}
		}
		console.log("[unsend] could not unsend", ids.join(","), "-", lastError && (lastError.message || lastError));
		return message.reply(getLang("failed") + "\n" + String((lastError && lastError.message) || lastError).slice(0, 600)
			+ `\nthread: ${event.threadID}\nreply.senderID: ${replied.senderID}\nbot: ${api.getCurrentUserID && api.getCurrentUserID()}`
			+ `\nclient methods: ${require("../../func/igcompat/apiCompat.js").apiMethodHints(api).join(",") || "none"}`);
	}
};
