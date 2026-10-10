/*
 * Socket.IO uptime channel
 * ------------------------
 * Called when config.serverUptime.socket.enable == true. Exposes a small,
 * token-gated channel that lets an external monitor receive the bot's live
 * status instead of (or in addition to) the plain /uptime HTTP ping.
 *
 * Client contract (see ./connectSocketIO.example.js):
 *   connect with query { verifyToken }
 *   server emits on `channelName`:
 *     { status: "error",   message: "Token is invalid" }
 *     { status: "success", message: "Connected to server successfully" }
 *     { status: "uptime",  uptime, statusAccountBot, engine, uptimeStatus }
 *   when the token is valid.
 *
 * Instagram edition by lazyneoaz (Saifullah Al Neoaz) - https://github.com/lazyneoaz
 */
const { Server } = require("socket.io");
const { log, getText } = global.utils;
const { config } = global.GoatBot;

module.exports = async (server) => {
        const { channelName, verifyToken } = config.serverUptime.socket;
        let io;

        try {
                if (!channelName)
                        throw ('"channelName" is not defined in config');
                if (!verifyToken)
                        throw ('"verifyToken" is not defined in config');
                io = new Server(server, {
                        cors: { origin: "*" }
                });
                log.info("SOCKET IO", getText("socketIO", "connected"));
        }
        catch (err) {
                return log.err("SOCKET IO", getText("socketIO", "error"), err);
        }

        io.on("connection", (socket) => {
                if (socket.handshake.query.verifyToken != verifyToken) {
                        io.to(socket.id).emit(channelName, {
                                status: "error",
                                message: "Token is invalid"
                        });
                        socket.disconnect();
                        return;
                }
                log.info("SOCKET IO", `New client connected to socket: ${socket.id}`);
                io.to(socket.id).emit(channelName, {
                        status: "success",
                        message: "Connected to server successfully"
                });

                // Push live status on connect and then on every tick, so a monitor
                // never has to poll the HTTP endpoint separately.
                const emitStatus = () => {
                        io.to(socket.id).emit(channelName, {
                                status: "uptime",
                                uptime: process.uptime(),
                                statusAccountBot: global.statusAccountBot,
                                uptimeStatus: global.UptimeStatus || { status: "unknown" }
                        });
                };
                emitStatus();
                const timer = setInterval(emitStatus, 30000);

                socket.on("disconnect", () => {
                        clearInterval(timer);
                        log.info("SOCKET IO", `Client disconnected from socket: ${socket.id}`);
                });
        });
};
