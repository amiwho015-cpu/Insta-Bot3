const axios = require("axios");

module.exports = {
        config: {
                name: "groupavatar",
                aliases: ["setgroupavatar", "changegroupimage"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 1,
                description: {
                        en: "Change the avatar of the current group chat"
                },
                category: "box chat",
                guide: {
                        en: "   {pn} <image url>: set the group avatar from an image url"
                                + "\n   {pn} (reply to an image): set the group avatar from the replied image"
                                + "\n   {pn} remove: remove the group avatar"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Please enter an image url or reply to an image",
                        notGroup: "❌ This command can only be used in a group chat",
                        invalidImage: "❌ Invalid image format",
                        cannotGetImage: "❌ An error occurred while fetching the image",
                        removed: "✅ Removed the group avatar",
                        success: "✅ Changed the group avatar",
                        failed: "❌ Failed to change the group avatar: %1"
                }
        },

        onStart: async function ({ api, event, args, message, getLang }) {
                if (!event.isGroup)
                        return message.reply(getLang("notGroup"));

                if (["remove", "delete", "reset"].includes((args[0] || "").toLowerCase())) {
                        try {
                                await api.changeGroupImage(null, event.threadID);
                                return message.reply(getLang("removed"));
                        }
                        catch (e) {
                                return message.reply(getLang("failed", e.error || e.message || String(e)));
                        }
                }

                const imageURL = (args[0] || "").startsWith("http")
                        ? args[0]
                        : (event.attachments[0]?.url || event.messageReply?.attachments[0]?.url);
                if (!imageURL)
                        return message.reply(getLang("syntaxError"));

                let response;
                try {
                        response = await axios.get(imageURL, { responseType: "stream" });
                }
                catch (e) {
                        return message.reply(getLang("cannotGetImage"));
                }
                if (!String(response.headers["content-type"] || "").includes("image"))
                        return message.reply(getLang("invalidImage"));
                response.data.path = "groupavatar.jpg";

                try {
                        await api.changeGroupImage(response.data, event.threadID);
                        return message.reply(getLang("success"));
                }
                catch (e) {
                        return message.reply(getLang("failed", e.error || e.message || String(e)));
                }
        }
};
