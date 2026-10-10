const axios = require("axios");
const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "wanted",
    version: "1.0.0",
    author: "CRX Shihab",
    countDown: 5,
    role: 0,
    shortDescription: "Wanted poster generation",
    longDescription: "Create a Wanted poster with user avatar",
    category: "FUN & SOCIAL",
    guide: {
      en: "{pn} [@mention / reply / UID]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, mentions, type, messageReply, senderID } = event;
    let targetID;

    if (type === "message_reply") {
      targetID = messageReply.senderID;
    } else if (Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args.length > 0 && !isNaN(args[0])) {
      targetID = args[0];
    } else {
      targetID = senderID;
    }

    try {
      const info = await api.getUserInfo(targetID);
      const name = info[targetID].name;

      api.sendMessage(``, threadID, undefined, messageID);

      const avatarURL = (await global.utils.igAvatarUrl(targetID));
      
      const avatarRes = await axios.get(avatarURL, { responseType: 'arraybuffer' });
      const avatarBuffer = Buffer.from(avatarRes.data, 'utf-8');

      const img = await new DIG.Wanted().getImage(avatarBuffer, "$");
      
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      const pathSave = path.join(cacheDir, `wanted_${targetID}.png`);

      fs.writeFileSync(pathSave, Buffer.from(img));

      return api.sendMessage({
        body: ``,
        attachment: fs.createReadStream(pathSave)
      }, threadID, () => {
        if (fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      }, messageID);

    } catch (error) {
      console.error(error);
      return api.sendMessage("Wanted poster error ❌", threadID, undefined, messageID);
    }
  }
};
