module.exports = {
        config: {
                name: "setadmin",
                aliases: ["promote", "addadmin", "unadmin", "demote", "removeadmin"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 1,
                description: {
                        en: "Promote or demote group chat admins"
                },
                category: "box chat",
                guide: {
                        en: "   {pn} @tag: promote tagged members to admin"
                                + "\n   {pn} remove @tag: demote tagged admins"
                                + "\n   Reply to a message with {pn} to promote its sender"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Please tag a member or reply to a message",
                        notGroup: "❌ This command can only be used in a group chat",
                        needAdmin: "❌ Please make the bot an admin of this group before using this feature",
                        success: "✅ %1 %2",
                        promoted: "promoted",
                        demoted: "demoted",
                        failed: "❌ Failed to update admin for %1: %2"
                }
        },

        onStart: async function ({ api, event, args, message, threadsData, commandName, getLang }) {
                if (!event.isGroup)
                        return message.reply(getLang("notGroup"));

                const adminIDs = (await threadsData.get(event.threadID, "adminIDs")) || [];
                if (!adminIDs.includes(api.getCurrentUserID()))
                        return message.reply(getLang("needAdmin"));

                const removeWords = ["remove", "unadmin", "demote", "removeadmin", "-r"];
                const isRemove = removeWords.includes((args[0] || "").toLowerCase())
                        || ["unadmin", "demote", "removeadmin"].includes(commandName);
                const label = isRemove ? getLang("demoted") : getLang("promoted");

                const targets = [];
                const mentionIDs = Object.keys(event.mentions || {});
                if (mentionIDs.length)
                        for (const id of mentionIDs)
                                targets.push({ id, label: String(event.mentions[id] || "").replace(/^@/, "") || id });
                else if (event.messageReply)
                        targets.push({ id: event.messageReply.senderID, label: event.messageReply.senderID });
                else
                        return message.reply(getLang("syntaxError"));

                let msg = "";
                for (const t of targets) {
                        try {
                                await api.changeAdminStatus(event.threadID, t.id, !isRemove);
                                msg += getLang("success", t.label, label) + "\n";
                        }
                        catch (e) {
                                msg += getLang("failed", t.label, e.error || e.message || String(e)) + "\n";
                        }
                }
                return message.reply(msg.trim());
        }
};
