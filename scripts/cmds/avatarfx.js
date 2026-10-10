"use strict";

const EFFECTS = {
	love: ["love", "heart"],
	angry: ["angry", "mad"],
	laugh: ["laugh", "lol"],
	cry: ["cry", "sad"]
};

module.exports = {
	config: {
		name: "avatarfx",
		aliases: ["avfx", "avatar-effect"],
		author: "Neoaz 🐊",
		category: "utility",
		countDown: 3,
		role: 0,
		description: { en: "Send text with an animated avatar character effect" },
		usage: { en: "{p}avatarfx <love|angry|laugh|cry> <text>" }
	},

	onStart: async function ({ message, args, api, event }) {
		const key = (args.shift() || "").toLowerCase();
		const effect = Object.keys(EFFECTS).find(name => EFFECTS[name].includes(key));
		if (!effect)
			return message.reply(`Pick an effect: ${Object.keys(EFFECTS).join(", ")}.\nExample: avatarfx laugh Nice one!`);

		const text = args.join(" ") || "✨";
		try {
			if (typeof api.sendAvatarTextEffect !== "function")
				throw new Error("Avatar effects are not supported by this Instagram client.");
			await new Promise((resolve, reject) => {
				let done = false;
				const fin = (e, r) => { if (done) return; done = true; e ? reject(e) : resolve(r); };
				const ret = api.sendAvatarTextEffect(text, event.threadID, effect, fin);
				if (ret && typeof ret.then === "function") ret.then(r => fin(null, r), e => fin(e));
			});
		}
		catch (error) {
			return message.reply(String(error && error.message || error));
		}
	}
};
