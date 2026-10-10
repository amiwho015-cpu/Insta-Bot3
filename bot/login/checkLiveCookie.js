"use strict";

/**
 * Instagram session liveness check.
 *
 * Replaces the old Facebook `mbasic.facebook.com/settings` probe (that endpoint
 * has been deprecated/removed by Meta). It delegates to the client's own
 * session probe, which GETs the authenticated
 * `/api/v1/accounts/current_user/` endpoint with the account's cookies.
 *
 * @param {Array<{key: string, value: string}>|string} appState
 *        The IG appState/cookie array (GoatBot `{key,value}` objects) or a raw
 *        Cookie header string (`sessionid=...; ds_user_id=...`).
 * @param {string} [userAgent] Optional user agent override (kept for backwards
 *        compatibility; the client derives a native Instagram UA by default).
 * @returns {Promise<boolean>} True if the session is still valid.
 */
module.exports = async function (appState, userAgent) {
        try {
                const igChatApi = require("@lazyneoaz/ig-chat-api");
                const utils = igChatApi.utils;

                let cookies = appState;
                if (typeof appState === "string") {
                        cookies = appState.split(";")
                                .map(part => {
                                        const idx = part.indexOf("=");
                                        return { key: (part.slice(0, idx) || "").trim(), value: (part.slice(idx + 1) || "").trim() };
                                })
                                .filter(c => c.key && c.value);
                }
                if (!Array.isArray(cookies) || !cookies.some(c => c.key === "sessionid" || c.key === "authorization"))
                        return false;

                const jar = utils.getJar();
                for (const cookie of cookies) {
                        jar.setCookie(
                                `${cookie.key}=${cookie.value}; path=/; domain=instagram.com`,
                                "https://www.instagram.com"
                        );
                }

                let dsUserID = null;
                for (const cookie of cookies)
                        if (cookie.key === "ds_user_id")
                                dsUserID = cookie.value;

                const ctx = {
                        jar,
                        userID: dsUserID,
                        globalOptions: { userAgent: userAgent || undefined },
                        language: "en_US"
                };
                return await utils.checkLiveCookie(ctx, utils.makeDefaults(null, dsUserID, ctx));
        }
        catch (e) {
                return false;
        }
};
