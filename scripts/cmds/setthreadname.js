module.exports = {
        config: {
                name: "setthreadname",
                aliases: ["settitle", "renamethread"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 1,
                description: {
                        en: "Change the name of the current group chat"
                },
                category: "box chat",
                guide: {
                        en: "   {pn} <new name>: rename the current group chat"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Please enter the new thread name",
                        notGroup: "❌ This command can only be used in a group chat",
                        needAdmin: "❌ Please make the bot an admin of this group before using this feature",
                        success: "✅ Changed the thread name to \"%1\"",
                        failed: "❌ Failed to change the thread name: %1"
                }
        },

        onStart: async function ({ api, event, args, message, threadsData, getLang }) {
                if (!event.isGroup)
                        return message.reply(getLang("notGroup"));
                const name = args.join(" ").trim();
                if (!name)
                        return message.reply(getLang("syntaxError"));

                const adminIDs = (await threadsData.get(event.threadID, "adminIDs")) || [];
                if (!adminIDs.includes(api.getCurrentUserID()))
                        return message.reply(getLang("needAdmin"));

                try {
                        await api.setTitle(name, event.threadID);
                        return message.reply(getLang("success", name));
                }
                catch (e) {
                        return message.reply(getLang("failed", e.error || e.message || String(e)));
                }
        }
};
