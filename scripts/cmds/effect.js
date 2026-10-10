const AVATAR_WORDS = ["avatar", "av", "avt", "avfx", "avatarfx"];

const PLAIN_ALIASES = {
        love: "love", heart: "love", hearts: "love",
        gift: "gift_wrap", present: "gift_wrap", giftwrap: "gift_wrap", gift_wrap: "gift_wrap",
        celebration: "celebration", confetti: "celebration", party: "celebration",
        fire: "fire", flame: "fire", hot: "fire"
};

const AVATAR_ALIASES = {
        love: "love", heart: "love", hearts: "love",
        anger: "anger", angry: "anger", mad: "anger",
        laugh: "laugh", lol: "laugh", laughing: "laugh", happy: "laugh",
        cry: "cry", sad: "cry", crying: "cry",
        random: "random", rand: "random"
};

const PLAIN_STYLE = { love: 1, gift_wrap: 2, celebration: 3, fire: 4 };

function norm(word) {
        return String(word || "").toLowerCase().replace(/[\s_-]+/g, "");
}

function plainEffect(word, list) {
        const key = PLAIN_ALIASES[norm(word)];
        if (!key) return null;
        const style = PLAIN_STYLE[key];
        return (list || []).find(e => String(e.style) === String(style))
                || { style: style, label: key };
}

module.exports = {
        config: {
                name: "effect",
                aliases: ["powerup", "fx", "pow"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 0,
                description: {
                        en: "Send Instagram/Messenger effects (plain text effects and avatar effects)"
                },
                category: "media",
                guide: {
                        en: "   {pn} list: show every available effect"
                                + "\n   {pn} <name> [text]: send a plain text effect (love, gift, celebration, fire)"
                                + "\n   {pn} avatar <name> [text]: send an avatar effect (love, anger, laugh, cry, random)"
                                + "\n   Example: {pn} love hello\n   {pn} avatar random hi"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Please enter an effect name, e.g. {pn} love hello",
                        unknown: "❌ No effect named \"%1\". Use {pn} list to see every effect.",
                        error: "❌ An error occurred: %1",
                        listHeader: "🎭 Effect list:\n\n🔤 Text effects:\n%1\n\n🧑 Avatar effects:\n%2\n\nUse: {pn} <name> [text]\nOr: {pn} avatar <name> [text]"
                }
        },

        onStart: async function ({ api, args, event, message, getLang }) {
                const threadID = event.threadID;
                const messageID = event.messageID;
                const first = norm(args[0]);

                if (first === "list" || first === "menu" || !args.length) {
                        const plain = (typeof api.listEffects === "function" ? api.listEffects() : [])
                                .map(e => `   • ${e.label || e.tag} (${(e.aliases || [])[0] || e.style}) ${e.emoji || ""}`);
                        const avatars = (typeof api.listAvatarEffects === "function" ? api.listAvatarEffects() : [])
                                .map(a => `   • ${a.label || a.name} (${a.name})`);
                        if (!args.length && !plain.length && !avatars.length)
                                return message.reply(getLang("syntaxError"));
                        return message.reply(getLang("listHeader", plain.join("\n"), avatars.join("\n")));
                }

                let body = "";

                if (AVATAR_WORDS.indexOf(first) !== -1) {
                        const name = args[1];
                        body = args.slice(2).join(" ");
                        if (!name) return message.reply(getLang("syntaxError"));
                        const avatarName = AVATAR_ALIASES[norm(name)] || null;
                        if (!avatarName) return message.reply(getLang("unknown", name));
                        try {
                                await new Promise((resolve, reject) => {
                                        api.sendMessage({ avatar: avatarName, body: body || undefined }, threadID, err => err ? reject(err) : resolve(), messageID);
                                });
                                return;
                        }
                        catch (err) {
                                return message.reply(getLang("error", err.error || err.message || JSON.stringify(err)));
                        }
                }

                const name = args[0];
                body = args.slice(1).join(" ");
                const plain = plainEffect(name, typeof api.listEffects === "function" ? api.listEffects() : []);
                const avt = AVATAR_ALIASES[norm(name)];

                if (plain) {
                        try {
                                await new Promise((resolve, reject) => {
                                        api.sendMessage({ effect: plain.style, body: body || undefined }, threadID, err => err ? reject(err) : resolve(), messageID);
                                });
                                return;
                        }
                        catch (err) {
                                return message.reply(getLang("error", err.error || err.message || JSON.stringify(err)));
                        }
                }
                if (avt) {
                        try {
                                await new Promise((resolve, reject) => {
                                        api.sendMessage({ avatar: avt, body: body || undefined }, threadID, err => err ? reject(err) : resolve(), messageID);
                                });
                                return;
                        }
                        catch (err) {
                                return message.reply(getLang("error", err.error || err.message || JSON.stringify(err)));
                        }
                }
                return message.reply(getLang("unknown", name));
        }
};
