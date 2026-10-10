/*
 * Example: connect to the bot's Socket.IO uptime channel.
 * Instagram edition by lazyneoaz (Saifullah Al Neoaz) - https://github.com/lazyneoaz
 *
 * Set config.serverUptime.socket.enable = true and the same verifyToken in
 * config.json, then run: node bot/login/connectSocketIO.example.js
 */
const { io } = require("socket.io-client");

const URL = process.env.UPTIME_URL || "http://localhost:3001";
const VERIFY_TOKEN = process.env.UPTIME_TOKEN || "change-me";
const CHANNEL = process.env.UPTIME_CHANNEL || "uptime";

const socket = io(URL, {
        query: { verifyToken: VERIFY_TOKEN }
});

socket.on(CHANNEL, (data) => {
        if (data.status === "error") {
                console.error("Rejected by server:", data.message);
                return;
        }
        if (data.status === "uptime") {
                console.log("[uptime]", data.uptime.toFixed(0) + "s", "| account:", data.statusAccountBot, "| ping:", data.uptimeStatus?.status);
                return;
        }
        console.log(data);
});

socket.on("connect", () => console.log("Connected to", URL));
socket.on("connect_error", (err) => console.error("Connection error:", err.message));
socket.on("disconnect", (reason) => console.log("Disconnected:", reason));
