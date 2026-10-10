"use strict";
const rh = require("../../func/igcompat/replyHandler")("roll");

module.exports = {
	config: {
		name: "roll",
		aliases: [],
		author: "you",
		category: "custom",
		countDown: 3,
		role: 0,
		description: { en: "Roll a dice and remember a favourite number" },
		guide: { en: "{pn} [sides]" }
	},

	onReply: rh.onReply,

	onStart: async function ({ message, args, event, usersData }) {
		const setReplyHandler = rh.bind(event);
		const sides = Number(args[0]) > 1 ? Math.floor(Number(args[0])) : 6;
		const value = 1 + Math.floor(Math.random() * sides);

		const sent = await message.reply(`Rolled a d${sides}: ${value}\nReply "pick <n>" to save a favourite.`);

		setReplyHandler(async ({ event: replyEvent, message: replyMessage }) => {
			const [action, n] = String(replyEvent.body || "").trim().split(/\s+/);
			if (action !== "pick" || !/^\d+$/.test(n)) return;
			const data = ((await usersData.get(replyEvent.senderID)) || {}).data || {};
			await usersData.set(replyEvent.senderID, Object.assign({}, data, { favourite: Number(n) }), "data");
			await replyMessage.reply(`Saved your favourite number: ${n}`);
		}, sent && sent.messageID);
	}
};
