const { findUid } = global.utils;

module.exports = {
        config: {
                name: "newgroup",
                aliases: ["creategroup", "newchat"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 0,
                description: {
                        en: "Create a new group chat"
                },
                category: "box chat",
                guide: {
                        en: "   {pn} <name> | @tag: create a group with tagged members"
                                + "\n   {pn} <name> | <username>: create a group with a username"
                                + "\n   Example: {pn} My group | @tag1 @tag2"
                                + "\n   Example: {pn} My group | nkx.bot"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Usage: {pn} <name> | @tag or <username>",
                        notFound: "❌ Could not resolve %1",
                        success: "✅ Created group \"%1\" with id %2",
                        failed: "❌ Failed to create the group: %1"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                const parts = args.join(" ").split("|");
                const title = (parts[0] || "").trim();
                const memberPart = parts.slice(1).join("|").trim();
                if (!title || !memberPart)
                        return message.reply(getLang("syntaxError"));

                const ids = Object.keys(event.mentions || {});
                let msg = "";
                for (const token of memberPart.split(/[\s,]+/).filter(Boolean)) {
                        if (/^\d+$/.test(token)) {
                                ids.push(token);
                                continue;
                        }
                        try {
                                ids.push(await findUid(token));
                        }
                        catch (e) {
                                msg += getLang("notFound", token) + "\n";
                        }
                }
                if (!ids.length)
                        return message.reply(msg.trim() || getLang("syntaxError"));

                try {
                        const threadID = await api.createNewGroup(ids, title);
                        return message.reply(msg + getLang("success", title, threadID));
                }
                catch (e) {
                        return message.reply(getLang("failed", e.error || e.message || String(e)));
                }
        }
};
