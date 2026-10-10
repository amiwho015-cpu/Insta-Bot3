const { getStreamFromURL } = global.utils;

module.exports = {
        config: {
                name: "threadinfo",
                aliases: ["boxinfo", "groupinfo"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 0,
                description: {
                        en: "View information about the current or a specified chat"
                },
                category: "info",
                guide: {
                        en: "   {pn}: view information about the current chat"
                                + "\n   {pn} <threadID>: view information about a specific chat"
                }
        },

        langs: {
                en: {
                        failed: "❌ Failed to fetch thread info: %1"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const threadID = args[0] && /^\d+$/.test(args[0]) ? args[0] : event.threadID;
                let info;
                try {
                        info = await api.getThreadInfo(threadID);
                }
                catch (e) {
                        return message.reply(getLang("failed", e.error || e.message || String(e)));
                }
                const adminIDs = (info.adminIDs || []).map(a => a.id);
                const msg = "» Thread ID: " + info.threadID
                        + "\n» Name: " + info.name
                        + "\n» Type: " + (info.isGroup ? "Group" : "Private")
                        + "\n» Members: " + ((info.participantIDs || []).length)
                        + "\n» Admins: " + (adminIDs.join(", ") || "none")
                        + "\n» Muted: " + (info.isMuted ? "yes" : "no")
                        + "\n» Archived: " + (info.isArchived ? "yes" : "no")
                        + "\n» Messages: " + info.messageCount;
                if (!info.imageSrc)
                        return message.reply(msg);
                try {
                        const stream = await getStreamFromURL(info.imageSrc);
                        return message.reply({ body: msg, attachment: stream });
                }
                catch (e) {
                        return message.reply(msg);
                }
        }
};
