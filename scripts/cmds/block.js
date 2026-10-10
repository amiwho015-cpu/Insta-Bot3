const { findUid } = global.utils;

module.exports = {
        config: {
                name: "block",
                aliases: ["blockuser", "unblock", "unblockuser"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 1,
                description: {
                        en: "Block or unblock Instagram users"
                },
                category: "user",
                guide: {
                        en: "   {pn} @tag: block tagged users"
                                + "\n   {pn} <username|profile link>: block a username or profile link"
                                + "\n   {pn} unblock @tag: unblock tagged users"
                                + "\n   Reply to a message with {pn} to block its sender"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Please tag someone, reply to a message, or enter a username",
                        success: "✅ %1 %2",
                        blocked: "blocked",
                        unblocked: "unblocked",
                        failed: "❌ Failed to %1 %2: %3",
                        notFound: "❌ Could not resolve %1"
                }
        },

        onStart: async function ({ api, event, args, message, commandName, getLang }) {
                const isUnblock = ["unblock", "unblockuser"].includes(commandName)
                        || ["unblock", "-u"].includes((args[0] || "").toLowerCase());

                const targets = [];
                if (event.messageReply)
                        targets.push({ id: event.messageReply.senderID, label: event.messageReply.senderID });
                else if (event.mentions && Object.keys(event.mentions).length)
                        for (const id of Object.keys(event.mentions))
                                targets.push({ id, label: String(event.mentions[id] || "").replace(/^@/, "") || id });
                else if (args.length) {
                        const rest = ["unblock", "-u"].includes((args[0] || "").toLowerCase()) ? args.slice(1) : args;
                        for (const arg of rest) {
                                try {
                                        targets.push({ id: await findUid(arg), label: arg });
                                }
                                catch (e) {
                                        targets.push({ error: true, label: arg });
                                }
                        }
                }
                else
                        return message.reply(getLang("syntaxError"));

                const action = isUnblock ? getLang("unblocked") : getLang("blocked");
                let msg = "";
                for (const t of targets) {
                        if (t.error) {
                                msg += getLang("notFound", t.label) + "\n";
                                continue;
                        }
                        try {
                                await api.changeBlockedStatus(t.id, !isUnblock);
                                msg += getLang("success", action, t.label) + "\n";
                        }
                        catch (e) {
                                msg += getLang("failed", action, t.label, e.error || e.message || String(e)) + "\n";
                        }
                }
                return message.reply(msg.trim());
        }
};
