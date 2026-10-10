const { getPrefix } = global.utils;
const { commands } = global.GoatBot;

module.exports = {
	config: {
		name: "help2",
		version: "1.0",
		author: "NTKhang & Neokex",
		countDown: 5,
		role: 0,
		description: { en: "Show command list - part 2 of 3" },
		category: "info",
		guide: { en: "{pn}" }
	},

	onStart: async function ({ message, event, role }) {
		const prefix = getPrefix(event.threadID);
		const allNames = [];
		for (const [name, value] of commands) {
			if (value.config.role > 1 && role < value.config.role)
				continue;
			allNames.push(name);
		}
		allNames.sort((x, y) => x.localeCompare(y));

		const total = allNames.length;
		const partSize = Math.ceil(total / 3);
		const part = allNames.slice((2 - 1) * partSize, 2 * partSize);

		const lines = [
			"☠️ NEOKEX AI ☠️",
			"",
			"╭─『 PART 2/3 』",
			"│ " + (part.length ? part.join(" • ") : "No commands in this part"),
			"╰───────────────♢",
			`Total Commands: ${total}`,
			`Type: ${prefix}help <command> for details`
		];
		return message.reply(lines.join("\n"));
	}
};
