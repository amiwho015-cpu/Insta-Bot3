module.exports = {
        config: {
                name: "poll",
                aliases: ["createpoll", "vote"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 0,
                description: {
                        en: "Create a poll in the current group chat"
                },
                category: "box chat",
                guide: {
                        en: "   {pn} <question> | <option1> | <option2> | ..."
                                + "\n   Example: {pn} Best color? | Red | Blue | Green"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Usage: {pn} <question> | <option1> | <option2> | ...",
                        notGroup: "❌ This command can only be used in a group chat",
                        success: "✅ Poll created",
                        failed: "❌ Failed to create the poll: %1"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                if (!event.isGroup)
                        return message.reply(getLang("notGroup"));

                const parts = args.join(" ").split("|").map(s => s.trim()).filter(Boolean);
                if (parts.length < 3)
                        return message.reply(getLang("syntaxError"));

                const title = parts[0];
                const options = parts.slice(1);

                try {
                        await api.createPoll(title, event.threadID, options);
                        return message.reply(getLang("success"));
                }
                catch (e) {
                        return message.reply(getLang("failed", e.error || e.message || String(e)));
                }
        }
};
