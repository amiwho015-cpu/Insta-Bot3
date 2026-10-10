module.exports = {
        config: {
                name: "leave",
                aliases: ["leavegroup", "outgroup", "exitgroup"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 1,
                description: {
                        en: "Make the bot leave the current group chat"
                },
                category: "box chat",
                guide: {
                        en: "   {pn}: make the bot leave the current group chat"
                }
        },

        langs: {
                en: {
                        notGroup: "❌ This command can only be used in a group chat",
                        confirm: "⚠️ Are you sure you want the bot to leave this group?\nReply \"yes\" to confirm.",
                        cancelled: "✅ Cancelled",
                        success: "✅ Left the group chat",
                        failed: "❌ Failed to leave the group: %1"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                if (!event.isGroup)
                        return message.reply(getLang("notGroup"));

                if (args[0] !== "yes")
                        return message.reply(getLang("confirm"));

                try {
                        await api.deleteThread(event.threadID);
                        return message.reply(getLang("success"));
                }
                catch (e) {
                        return message.reply(getLang("failed", e.error || e.message || String(e)));
                }
        }
};
