const helpCmd = require("./help.js");

module.exports = {
	config: {
		name: "help3",
		version: "1.0",
		author: "NTKhang & Neokex",
		countDown: 5,
		role: 0,
		description: {
			en: "View command list (page 3 of 3)"
		},
		category: "info",
		guide: {
			en: "{pn}: show command list page 3"
				+ "\\n   {pn} <command name>: show command details"
		},
		priority: 1
	},

	// share the same texts as the main help command
	langs: helpCmd.langs,

	onStart: async function (ctx) {
		return helpCmd.onStart({ ...ctx, page: 3 });
	}
};
