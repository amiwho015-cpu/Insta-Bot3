"use strict";

const t = require("../../func/igcompat/languages").text;

module.exports = {
	config: {
		name: "ping",
		aliases: ["pong"],
		author: "Neoaz 🐊",
		category: "info",
		cooldown: 2,
		role: 0,
		description: { en: "Check whether the bot is online" },
		usage: { en: "{p}ping" }
	},

	onStart: async function ({ message, config }) {
		const start = Date.now();
		await message.reply(t("en", "pingProcessing"));
		return message.send(t("en", "pingResult", Date.now() - start));
	}
};
