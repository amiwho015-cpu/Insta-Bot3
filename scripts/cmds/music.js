module.exports = {
        config: {
                name: "music",
                aliases: ["musics", "song", "musicsticker"],
                version: "1.0",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 0,
                description: {
                        en: "Send an Instagram music sticker matching a search query"
                },
                category: "media",
                guide: {
                        en: "   {pn} <song name>: find and send the best-matching music sticker"
                }
        },

        langs: {
                en: {
                        syntaxError: "⚠️ Please enter the song name to search for",
                        notFound: "❌ No song matched \"%1\"",
                        error: "❌ An error occurred: %1"
                }
        },

        onStart: async function ({ api, args, event, message, getLang }) {
                const query = args.join(" ").trim();
                if (!query)
                        return message.reply(getLang("syntaxError"));

                await message.reaction("⌛", event.messageID);

                const track = await resolveTrack(api, query);
                if (!track) {
                        await message.reaction("❌", event.messageID);
                        return message.reply(getLang("notFound", query));
                }

                return new Promise(resolve => {
                        api.sendMessage(
                                { music: { audioClusterId: track.audio_cluster_id }, body: track.title },
                                event.threadID,
                                async (err) => {
                                        if (err) {
                                                await message.reaction("❌", event.messageID);
                                                resolve(message.reply(getLang("error", err.error || err.message || JSON.stringify(err))));
                                        }
                                        else {
                                                await message.reaction("✅", event.messageID);
                                                resolve();
                                        }
                                },
                                event.messageID
                        );
                });
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

        return {
                title: best.title || best.canonical_title || query,
                display_artist: best.display_artist || (best.artist && (best.artist.username || best.artist.name)) || "",
                // The generic_share broadcast takes the audio *cluster* id as
                // `audio_asset_id`; the track's own audio_asset_id is rejected.
                audio_cluster_id: best.audio_cluster_id || best.audio_asset_id || best.id,
                audio_asset_id: best.audio_asset_id || best.id || best.audio_cluster_id,
                duration_in_ms: best.duration_in_ms || 0,
                progressive_download_url: best.progressive_download_url || best.fast_start_progressive_download_url || "",
                fast_start_progressive_download_url: best.fast_start_progressive_download_url || "",
                web_30s_preview_download_url: best.web_30s_preview_download_url || ""
        };
}

function norm(str) {
        return String(str || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}
