const { findUid } = global.utils;

module.exports = {
        config: {
                name: "follow",
                aliases: ["fl"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 0,
                description: {
                        en: "Follow Instagram users"
                },
                category: "user",
                guide: {
                        en: "   {pn} @tag: follow tagged users"
                                + "\n   {pn} <username|profile link>: follow a username or profile link"
                                + "\n   Reply to a message with {pn} to follow its sender"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Please tag someone, reply to a message, or enter a username to follow",
                        success: "✅ Followed %1",
                        failed: "❌ Failed to follow %1: %2",
                        notFound: "❌ Could not resolve %1"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const targets = [];
                if (event.messageReply)
                        targets.push({ id: event.messageReply.senderID, label: event.messageReply.senderID });
                else if (event.mentions && Object.keys(event.mentions).length)
                        for (const id of Object.keys(event.mentions))
                                targets.push({ id, label: String(event.mentions[id] || "").replace(/^@/, "") || id });
                else if (args.length)
                        for (const arg of args) {
                                try {
                                        targets.push({ id: await findUid(arg), label: arg });
                                }
                                catch (e) {
                                        targets.push({ error: true, label: arg });
                                }
                        }
                else
                        return message.reply(getLang("syntaxError"));

                let msg = "";
                for (const t of targets) {
                        if (t.error) {
                                msg += getLang("notFound", t.label) + "\n";
                                continue;
                        }
                        try {
                                await api.follow(t.id);
                                msg += getLang("success", t.label) + "\n";
                        }
                        catch (e) {
                                msg += getLang("failed", t.label, e.error || e.message || String(e)) + "\n";
                        }
                }
                return message.reply(msg.trim());
        }
};
