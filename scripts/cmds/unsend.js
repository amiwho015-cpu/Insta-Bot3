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
		aliases: ["uns"],
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
		if (!replied || !replied.messageID)
			return message.reply(getLang("syntaxError"));

		try {
			await api.unsendMessage(replied.messageID, event.threadID);
		}
		catch (_) {
			// last resort: the message helper tries the same thing once more
			try {
				await message.unsend(replied.messageID);
			}
			catch (__) {
				return message.reply(getLang("failed"));
			}
		}
	}
};
