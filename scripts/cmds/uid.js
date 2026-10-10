const { findUid } = global.utils;

module.exports = {
	config: {
		name: "uid",
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem user id Instagram của người dùng",
			en: "View Instagram user id of user"
		},
		category: "info",
		guide: {
			vi: "   {pn}: dùng để xem id Instagram của bạn"
				+ "\n   {pn} @tag: xem id Instagram của những người được tag"
				+ "\n   {pn} <username|link profile>: xem id Instagram của link profile"
				+ "\n   Phản hồi tin nhắn của người khác kèm lệnh để xem id Instagram của họ",
			en: "   {pn}: use to view your Instagram user id"
				+ "\n   {pn} @tag: view Instagram user id of tagged people"
				+ "\n   {pn} <username|profile link>: view Instagram user id of a username or profile link"
				+ "\n   Reply to someone's message with the command to view their Instagram user id"
		}
	},

	langs: {
		vi: {
			syntaxError: "Vui lòng tag người muốn xem uid hoặc để trống để xem uid của bản thân"
		},
		en: {
			syntaxError: "Please tag the person you want to view uid or leave it blank to view your own uid"
		}
	},

	onStart: async function ({ message, event, args, getLang }) {
		if (event.messageReply)
			return message.reply(event.messageReply.senderID);
		if (!args[0])
			return message.reply(event.senderID);

		const { mentions } = event;
		// A mention (a typed @username) is resolved upstream: the engine turns
		// it into a mention whose key is the id and whose value is the username.
		// Print both; never echo the id twice.
		if (mentions && Object.keys(mentions).length) {
			let msg = "";
			for (const id of Object.keys(mentions)) {
				const name = String(mentions[id] || "").replace(/^@/, "");
				msg += name && name !== id ? `${name}: ${id}\n` : `${id}\n`;
			}
			return message.reply(msg.trim());
		}

		// Bare username or profile link: resolve it to the numeric id.
		// Previously only URLs took this path, so a bare username fell through
		// to the "please tag someone" error.
		let msg = "";
		for (const arg of args) {
			try {
				const uid = await findUid(arg);
				msg += `${arg}: ${uid}\n`;
			}
			catch (e) {
				msg += `${arg} (ERROR) => ${e.message}\n`;
			}
		}
		return message.reply(msg.trim() || getLang("syntaxError"));
	}
};