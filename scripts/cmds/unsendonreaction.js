const fs = require("fs-extra");

module.exports = {
	config: {
		name: "unsendonreaction",
		aliases: ["unsendreact", "uor"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 2,
		description: {
			en: "auto-unsend a bot message when an admin reacts to it"
		},
		category: "owner",
		guide: {
			en: "   {pn} [on | off]: turn auto-unsend on admin reaction on or off (leave blank to toggle)"
				+ "\n   {pn} status: show whether it is on or off"
		}
	},

	langs: {
		en: {
			turnedOn: "Auto-unsend on admin reaction is now on.",
			turnedOff: "Auto-unsend on admin reaction is now off.",
			status: "Auto-unsend on admin reaction is currently %1.",
			on: "on",
			off: "off"
		}
	},

	onStart: async function ({ message, args, getLang }) {
		const config = global.GoatBot.config;
		if (!config.customFeatures)
			config.customFeatures = {};
		if (!config.customFeatures.unsendOnReaction)
			config.customFeatures.unsendOnReaction = { reactions: ["😠", "😡"] };

		const option = args[0] ? args[0].toLowerCase() : "";
		const current = config.customFeatures.unsendOnReaction.enable == true;

		if (option === "status" || option === "check")
			return message.reply(getLang("status", current ? getLang("on") : getLang("off")));
		if (option && option !== "on" && option !== "off")
			return message.SyntaxError();

		const value = option === "on" ? true : option === "off" ? false : !current;
		config.customFeatures.unsendOnReaction.enable = value;
		fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
		return message.reply(getLang(value ? "turnedOn" : "turnedOff"));
	}
};
