"use strict";

const t = require("../../func/igcompat/languages").text;

module.exports = {
	config: {
		name: "echo",
		aliases: [],
		author: "Neoaz 🐊",
		category: "utility",
		cooldown: 2,
		role: 0,
		description: { en: "Repeat whatever you type after the command" },
		usage: { en: "{p}echo <text>" }
	},

	onStart: async function ({ message, args, config }) {
		if (!args.length)
			return message.reply(t("en", "echoEmpty"));
		return message.reply(args.join(" "));
	}
};
