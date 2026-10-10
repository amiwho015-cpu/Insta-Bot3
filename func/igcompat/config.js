"use strict";
/** Cookie helpers (account.txt parsing) used by the ported spy command. */
const fs = require("fs");
const path = require("path");
const ACCOUNT_PATH = path.resolve(__dirname, "..", "..", "account.txt");

function isNetScapeCookie(text) {
	return /(.+)\t(1|TRUE|true)\t([\w/.-]*)\t(1|TRUE|true)\t\d+\t([\w-]+)\t(.+)/i.test(text);
}

function netScapeToCookies(text) {
	const cookies = [];
	for (const rawLine of text.split(/\r?\n/)) {
		const line = rawLine.trim();
		// `#HttpOnly_` lines are real cookies, not comments; only skip the rest.
		if (!line || (line.startsWith("#") && !/^#HttpOnly_/i.test(line))) continue;
		const fields = line.replace(/^#HttpOnly_/i, "").split("\t").map(f => f.trim()).filter(Boolean);
		if (fields.length < 7) continue;
		cookies.push({
			key: fields[5],
			value: fields[6],
			domain: fields[0].replace(/^\./, ""),
			path: fields[2] || "/"
		});
	}
	return cookies;
}

function cookieHeaderToCookies(text) {
	return String(text)
		.replace(/^cookie\s*:/i, "")
		.replace(/\r?\n/g, " ")
		.split(";")
		.map(part => part.trim())
		.filter(Boolean)
		.map(part => {
			const index = part.indexOf("=");
			if (index < 1) return null;
			return {
				key: part.slice(0, index).trim(),
				value: part.slice(index + 1).trim(),
				domain: "instagram.com",
				path: "/"
			};
		})
		.filter(Boolean);
}

function normalizeCookies(list) {
	return (Array.isArray(list) ? list : [])
		.map(item => {
			if (!item || typeof item !== "object") return null;
			const key = item.key || item.name;
			return key ? { key, value: item.value, domain: item.domain || "instagram.com", path: item.path || "/" } : null;
		})
		.filter(item => item && item.key && item.value !== undefined);
}

/**
 * Parse account.txt into an Instagram cookie list.
 * Accepts: JSON array, JSON object, cookie header string, Netscape file.
 */
function loadAccount() {
	if (!fs.existsSync(ACCOUNT_PATH))
		throw new Error(
			"account.txt not found. Copy account.example.txt to account.txt and paste your Instagram cookies. " +
			"It is git-ignored, so your cookies are never committed."
		);
	const text = fs.readFileSync(ACCOUNT_PATH, "utf8").trim();
	if (!text) throw new Error("account.txt is empty");

	let cookies = [];

	if (text.startsWith("[") || text.startsWith("{")) {
		let parsed;
		try {
			parsed = JSON.parse(text);
		}
		catch (error) {
			throw new Error(`account.txt is invalid JSON: ${error.message}`);
		}
		if (!Array.isArray(parsed)) {
			const obj = parsed.cookies || parsed.appState || parsed;
			parsed = Array.isArray(obj) ? obj : Object.keys(obj).map(key => ({ key, value: obj[key] }));
		}
		cookies = normalizeCookies(parsed);
	}
	else if (isNetScapeCookie(text)) {
		cookies = netScapeToCookies(text);
	}
	else {
		cookies = cookieHeaderToCookies(text);
	}

	const has = key => cookies.some(cookie => cookie.key === key);
	if (!has("sessionid") || !(has("ds_user_id") || has("userid")))
		throw new Error("account.txt must contain Instagram `sessionid` and `ds_user_id` cookies");

	return cookies;
}

module.exports = { loadAccount, normalizeCookies, netScapeToCookies, cookieHeaderToCookies, isNetScapeCookie };
