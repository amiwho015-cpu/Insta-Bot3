module.exports = {
        config: {
                name: "mute",
                aliases: ["mutebox", "unmute", "unmutebox"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 1,
                description: {
                        en: "Mute or unmute the current chat"
                },
                category: "box chat",
                guide: {
                        en: "   {pn}: mute the current chat"
                                + "\n   {pn} off | unmute: unmute the current chat"
                                + "\n   {pn} status: show the current mute state"
                }
        },

        langs: {
                en: {
                        muted: "🔕 Chat muted",
                        unmuted: "🔔 Chat unmuted",
                        statusMuted: "🔕 This chat is currently muted",
                        statusUnmuted: "🔔 This chat is currently unmuted",
                        failed: "❌ Failed to change the mute state: %1"
                }
        },

        onStart: async function ({ api, event, args, message, commandName, getLang }) {
                const arg = (args[0] || "").toLowerCase();
                let muted;
                if (["off", "unmute", "unmutebox"].includes(arg) || commandName === "unmute" || commandName === "unmutebox")
                        muted = false;
                else if (["on", "mute", "mutebox"].includes(arg) || commandName === "mute" || commandName === "mutebox")
                        muted = true;

                if (arg === "status") {
                        const threadInfo = await api.getThreadInfo(event.threadID);
                        return message.reply(threadInfo.isMuted ? getLang("statusMuted") : getLang("statusUnmuted"));
                }

                if (muted === undefined)
                        return message.reply(getLang("statusMuted"));

                try {
                        await api.muteThread(event.threadID, muted ? 3600 : 0);
                        return message.reply(muted ? getLang("muted") : getLang("unmuted"));
                }
                catch (e) {
                        return message.reply(getLang("failed", e.error || e.message || String(e)));
                }
        }
};
