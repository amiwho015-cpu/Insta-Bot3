"use strict";
/**
 * InstaBOT's `setReplyHandler(handler, messageID)` on top of GoatBot's onReply.
 *
 *   const rh = require("../../func/igcompat/replyHandler")("bby");
 *   onStart: ctx => { const setReplyHandler = rh.bind(ctx.event); ... }
 *   onReply: rh.onReply
 */
module.exports = function createReplyHandler(commandName) {
	function bind(event) {
		return function setReplyHandler(handler, messageID) {
			if (typeof handler !== "function" || !messageID) return;
			const key = String(messageID);
			global.GoatBot.onReply.set(key, {
				commandName,
				messageID: key,
				author: event && event.senderID,
				handler
			});
		};
	}

	async function onReply(ctx) {
		const Reply = ctx.Reply;
		if (!Reply || typeof Reply.handler !== "function") return;
		// one-shot, like InstaBOT: the handler re-arms itself when it wants more
		try { global.GoatBot.onReply.delete(String(Reply.messageID)); } catch (_) { /* ignore */ }
		return Reply.handler(Object.assign({}, ctx, { setReplyHandler: bind(ctx.event) }));
	}

	return { bind, onReply };
};
