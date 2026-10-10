/*
 * Auto uptime / self-ping keep-alive
 * ----------------------------------
 * Keeps the host awake (Replit / Glitch / free tiers sleep when idle) and
 * reports account health, by pinging this bot's own /uptime endpoint on a
 * fixed interval.
 *
 * Instagram edition by lazyneoaz (Saifullah Al Neoaz) - https://github.com/lazyneoaz
 */
const axios = require("axios");
const { config } = global.GoatBot;
const { log, getText } = global.utils;

if (global.timeOutUptime != undefined) {
        clearTimeout(global.timeOutUptime);
        clearInterval(global.timeOutUptime);
        global.timeOutUptime = undefined;
}
if (!config.autoUptime || !config.autoUptime.enable)
        return;

const PORT = config.dashBoard?.port || (!isNaN(config.serverUptime.port) && config.serverUptime.port) || 3001;
const INTERVAL = (Number(config.autoUptime.timeInterval) || 180) * 1000;

// Interval between pings is deliberately a touch shorter than the configured
// value so a slow response can never let two pings drift into the sleep window.
const PING_INTERVAL = Math.max(INTERVAL - 5000, INTERVAL * 0.9);

function resolveUrl() {
        if (config.autoUptime.url)
                return config.autoUptime.url;

        if (process.env.REPL_OWNER)
                return `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/uptime`;
        if (process.env.API_SERVER_EXTERNAL == "https://api.glitch.com")
                return `https://${process.env.PROJECT_DOMAIN}.glitch.me/uptime`;
        if (process.env.RENDER_EXTERNAL_URL)
                return `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "")}/uptime`;
        if (process.env.RAILWAY_PUBLIC_DOMAIN)
                return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/uptime`;

        return `http://localhost:${PORT}/uptime`;
}

const myUrl = resolveUrl();

// "unknown" until the first ping resolves, so a starting-up bot is never
// reported as failed.
let status = "unknown";
let pings = 0;
let fails = 0;
let lastOkAt = null;
let lastFailAt = null;

function announce(state, message, isError = false) {
        if (state == status)
                return;
        status = state;
        if (isError)
                log.err("UPTIME", message);
        else
                log.info("UPTIME", message);
}

async function autoUptime() {
        pings++;
        try {
                const { data } = await axios.get(myUrl, { timeout: 15000 });
                lastOkAt = Date.now();
                if (data && data.status == "error")
                        announce("account-error", `Bot is reachable but the account is unhealthy (${data.statusAccountBot || "unknown"})`, true);
                else
                        announce("ok", "Bot is online");
        }
        catch (e) {
                fails++;
                lastFailAt = Date.now();
                const detail = e.response?.data || {};
                if (detail.statusAccountBot == "can't login")
                        announce("account-error", "Can't login account bot", true);
                else if (detail.statusAccountBot == "block spam")
                        announce("account-error", "Your account is blocked", true);
                else
                        announce("unreachable", `Uptime ping failed (${e.message})`, true);
                // A custom alert hook can be wired in here (webhook, email, ...).
        }
        finally {
                global.UptimeStatus = { status, pings, fails, lastOkAt, lastFailAt };
        }
}

global.UptimeStatus = { status, pings, fails, lastOkAt, lastFailAt };

// First ping after one interval, then a steady interval. A plain recursive
// setInterval is used so a hung request cannot stack pings.
global.timeOutUptime = setInterval(autoUptime, PING_INTERVAL);
log.info("AUTO UPTIME", `${getText("autoUptime", "autoUptimeTurnedOn")} ${myUrl} (every ${Math.round(PING_INTERVAL / 1000)}s)`);
