const fs = require("fs-extra");

module.exports = {
	config: {
		name: "noprefix",
		aliases: ["np"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 2,
		description: {
			en: "use commands without the prefix (bot admins only)"
		},
		category: "owner",
		guide: {
			en: "   {pn} [on | off]: turn no-prefix mode on or off (leave blank to toggle)"
				+ "\n   {pn} status: show whether it is on or off"
				+ "\n   When on, a bot admin can run a command by sending its exact name/alias"
				+ "\n   with no prefix (e.g. \"help\" instead of \"" + "{pn}" + "\"). Normal chat"
				+ "\n   messages are never treated as commands."
		}
	},

	langs: {
		en: {
			turnedOn: "No-prefix mode is now on. Bot admins can run commands without a prefix.",
			turnedOff: "No-prefix mode is now off.",
			status: "No-prefix mode is currently %1.",
			on: "on",
			off: "off"
		}
	},

	onStart: async function ({ message, args, getLang }) {
		const config = global.GoatBot.config;
		if (!config.customFeatures)
			config.customFeatures = {};
		if (!config.customFeatures.noPrefix)
			config.customFeatures.noPrefix = {};

		const option = args[0] ? args[0].toLowerCase() : "";
		const current = config.customFeatures.noPrefix.enable == true;

		if (option === "status" || option === "check")
			return message.reply(getLang("status", current ? getLang("on") : getLang("off")));
		if (option && option !== "on" && option !== "off")
			return message.SyntaxError();

		const value = option === "on" ? true : option === "off" ? false : !current;
		config.customFeatures.noPrefix.enable = value;
		fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
		return message.reply(getLang(value ? "turnedOn" : "turnedOff"));
	}
};
