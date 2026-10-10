const fs = require("fs-extra");

module.exports = {
        config: {
                name: "getigstate",
                aliases: ["getstate", "getcookie", "getsession", "getfbstate"],
                version: "1.3",
                author: "NTKhang",
                countDown: 5,
                role: 2,
                description: {
                        vi: "Lấy session Instagram hiện tại",
                        en: "Get current Instagram session"
                },
                category: "owner",
                guide: {
                        en: "   {pn}: get the Instagram session (appState)\n"
                                + "   {pn} [cookies|cookie|c]: get it in cookies format\n"
                                + "   {pn} [string|str|s]: get it in cookie-string format\n",
                        vi: "   {pn}: lấy session Instagram (appState)\n"
                                + "   {pn} [cookies|cookie|c]: lấy dạng cookies\n"
                                + "   {pn} [string|str|s]: lấy dạng cookie string\n"
                }
        },

        langs: {
                vi: {
                        success: "Đã gửi session Instagram đến bạn, vui lòng kiểm tra tin nhắn riêng của bot"
                },
                en: {
                        success: "Sent the Instagram session to you, please check bot's private message"
                }
        },

        onStart: async function ({ message, api, event, args, getLang }) {
                let session;
                let fileName;

                if (["cookie", "cookies", "c"].includes(args[0])) {
                        session = JSON.stringify(api.getAppState().map(e => ({
                                name: e.key,
                                value: e.value
                        })), null, 2);
                        fileName = "cookies.json";
                }
                else if (["string", "str", "s"].includes(args[0])) {
                        session = api.getAppState().map(e => `${e.key}=${e.value}`).join("; ");
                        fileName = "cookiesString.txt";
                }
                else {
                        session = JSON.stringify(api.getAppState(), null, 2);
                        fileName = "appState.json";
                }

                const pathSave = `${__dirname}/tmp/${fileName}`;
                fs.writeFileSync(pathSave, session);

                if (event.senderID != event.threadID)
                        message.reply(getLang("success"));

                api.sendMessage({
                        body: session,
                        attachment: fs.createReadStream(pathSave)
                }, event.senderID, () => fs.unlinkSync(pathSave));
        }
};
