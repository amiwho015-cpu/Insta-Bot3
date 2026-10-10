const fs = require("fs-extra");
const axios = require("axios");

const MAX_SIZE = 25 * 1024 * 1024;

module.exports = {
        config: {
                name: "sing",
                aliases: ["singvoice", "voicesong", "singsong"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 10,
                role: 0,
                description: {
                        en: "Send the full song as a voice (audio) attachment"
                },
                category: "media",
                guide: {
                        en: "   {pn} <song name>: find and send the best-matching full song"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Please enter the song name to search for",
                        notFound: "❌ No song matched \"%1\"",
                        noSource: "❌ This song has no downloadable source",
                        tooLarge: "⚠️ The song is too large to send (%1MB > 25MB)",
                        error: "❌ An error occurred: %1"
                }
        },

        onStart: async function ({ api, args, event, message, getLang }) {
                const query = args.join(" ").trim();
                if (!query) {
                        await react("❌");
                        return message.reply(getLang("syntaxError"));
                }

                await react("⌛");

                const track = await resolveTrack(api, query);
                if (!track) {
                        await react("❌");
                        return message.reply(getLang("notFound", query));
                }

                const url = track.progressive_download_url
                        || track.fast_start_progressive_download_url
                        || track.web_30s_preview_download_url;
                if (!url) {
                        await react("❌");
                        return message.reply(getLang("noSource"));
                }

                const savePath = `${__dirname}/tmp/${Date.now()}_${event.senderID}.m4a`;

                async function react(emoji) {
                        try {
                                await message.reaction(emoji, event.messageID);
                        }
                        catch (e) { }
                }

                try {
                        const { data, headers } = await axios({
                                url,
                                method: "GET",
                                responseType: "stream",
                                headers: { Range: "bytes=0-" }
                        });
                        const size = Number(headers["content-length"] || 0);
                        if (size && size > MAX_SIZE) {
                                await react("❌");
                                return message.reply(getLang("tooLarge", (size / 1024 / 1024).toFixed(2)));
                        }

                        await fs.ensureDir(`${__dirname}/tmp`);
                        const ws = fs.createWriteStream(savePath);
                        await new Promise((resolve, reject) => {
                                data.pipe(ws);
                                ws.on("finish", resolve);
                                ws.on("error", reject);
                                data.on("error", reject);
                        });

                        if (fs.statSync(savePath).size > MAX_SIZE) {
                                await react("❌");
                                return message.reply(getLang("tooLarge", (fs.statSync(savePath).size / 1024 / 1024).toFixed(2)));
                        }

                        const stream = fs.createReadStream(savePath);
                        stream.path = savePath;
                        await new Promise((resolve, reject) => {
                                api.sendMessage(
                                        { body: `${track.title} - ${track.display_artist || ""}`, attachment: stream },
                                        event.threadID,
                                        (err) => err ? reject(err) : resolve()
                                );
                        });
                        await react("✅");
                        return;
                }
                catch (err) {
                        await react("❌");
                        return message.reply(getLang("error", err.error || err.message || JSON.stringify(err)));
                }
                finally {
                        fs.remove(savePath).catch(() => {});
                }
        }
};

async function resolveTrack(api, query) {
        const res = await api.searchMusic(query).catch(() => null);
        return pickTrack(res, query);
}

function pickTrack(res, query) {
        const items = (res && res.items) || [];
        const tracks = items
                .map(item => (item && (item.track || item.original_sound || item)) || null)
                .filter(t => t && (t.audio_asset_id || t.audio_cluster_id || t.id));
        if (!tracks.length) return null;

        const nq = norm(query);
        const tokens = String(query).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        let best = tracks[0];
        let bestScore = -1;
        for (const t of tracks) {
                const title = norm(t.title || t.canonical_title);
                let score = 0;
                if (title === nq) score += 100;
                else if (nq && title.indexOf(nq) !== -1) score += 50;
                for (const token of tokens)
                        if (title.indexOf(token) !== -1) score += 1;
                if (score > bestScore) {
                        bestScore = score;
                        best = t;
                }
        }
        return best;
}

function norm(str) {
        return String(str || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}
