const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

module.exports = {
	config: {
		name: "help3",
		version: "2.0",
		author: "NTKhang & Neokex",
		countDown: 5,
		role: 0,
		description: { en: "Show command list - page 3 of 3" },
		category: "info",
		guide: { en: "{pn}" }
	},

	onStart: async function ({ message, event, role }) {
		const prefix = getPrefix(event.threadID);
		const { buildPages } = require("../../func/igcompat/helpLayout.js");
		const pages = buildPages(commands, role, prefix);
		for (const text of pages[3 - 1])
			await message.reply(text);
	}
};
