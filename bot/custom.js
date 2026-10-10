const { log } = global.utils;

// Bound on how many of the bot's own outbound message ids we remember. Only
// used to decide whether an admin reaction targets a bot message, so a few
// thousand is plenty.
const MAX_TRACKED_MESSAGES = 3000;

module.exports = async function ({ api }) {
        // This is where you can add your custom code to the bot.
        // The bot runs this code every time it starts up (after logging in and loading data).

        // the Instagram client keeps the session alive on its own: it refreshes
        // the rotating tokens and the realtime stream cursor in the background,
        // so no manual refresh loop is needed here. The old GoatBot code called
        // api.refreshFb_dtsg() every 48h, which does not exist on Instagram.

        // Track every message the bot sends so unsendOnReaction can tell a bot
        // message apart from a user one. api.sendMessage is promise-based on the
        // Instagram client, so the id lands on the resolved value.
        const botSentMessages = global.GoatBot.botSentMessages || new Set();
        global.GoatBot.botSentMessages = botSentMessages;

        // ---- InstaBOT compat: working unsend / editMessage ----------------------
        // Instagram needs the thread id to unsend a message. Commands written for
        // GoatBot call api.unsendMessage(messageID[, callback]) with no thread, so
        // remember which thread each bot message went to and accept every call form:
        //   (messageID) (messageID, cb) (messageID, threadID) (messageID, threadID, cb)
        // Each form is tried with the argument order the Instagram client expects.
        require("../func/igcompat/apiCompat.js")(api);

        if (typeof api.sendMessage === "function" && !api.__botSentMessagesWrapped) {
                const originalSendMessage = api.sendMessage.bind(api);
                api.sendMessage = function (...args) {
                        const result = originalSendMessage(...args);
                        if (result && typeof result.then === "function") {
                                result.then((res) => {
                                        if (res && res.messageID) {
                                                botSentMessages.add(String(res.messageID));
                                                if (botSentMessages.size > MAX_TRACKED_MESSAGES)
                                                        botSentMessages.delete(botSentMessages.values().next().value);
                                        }
                                }).catch(() => { });
                        }
                        return result;
                };
                api.__botSentMessagesWrapped = true;
        }
};
