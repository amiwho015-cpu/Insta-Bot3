"use strict";

/**
 * Builds the help pages: every command is placed in ONE clean category
 * (the scattered raw categories are merged), each category is printed as a
 * block with all its commands on one line, and the blocks are spread over
 * 3 pages (help / help2 / help3). Long pages are split into several messages.
 */
const GROUPS = [
	["FUN & SOCIAL", ["fun & social", "fun", "anime"]],
	["LOVE", ["love"]],
	["GAMES", ["games", "game"]],
	["MEDIA & MUSIC", ["media", "tts"]],
	["AI", ["ai"]],
	["IMAGE", ["image"]],
	["TOOLS", ["tools", "utility", "software", "wiki", "other"]],
	["INFO", ["info", "profile"]],
	["ISLAMIC", ["islamic"]],
	["ECONOMY & RANK", ["economy", "rank"]],
	["GROUP CHAT", ["box chat", "chat", "admin", "contacts admin"]],
	["SETTINGS", ["custom", "config", "system", "user"]],
	["NSFW", ["nsfw"]],
	["OWNER", ["owner"]]
];
const CATEGORY_TO_GROUP = new Map();
for (const [title, cats] of GROUPS)
	for (const c of cats) CATEGORY_TO_GROUP.set(c, title);

const PAGES = 3;
const MAX_LEN = 950;          // keep every Instagram message comfortably short
const TITLE = "☠️ NEOKEX AI ☠️";

function collect(commands, role) {
	const byGroup = new Map(GROUPS.map(([title]) => [title, new Set()]));
	byGroup.set("OTHER", new Set());
	for (const [name, value] of commands) {
		const cfg = value.config || {};
		if (cfg.role > 1 && role < cfg.role)
			continue;
		const cat = String(cfg.category || "").trim().toLowerCase();
		const group = CATEGORY_TO_GROUP.get(cat) || "OTHER";
		byGroup.get(group).add(String(cfg.name || name));
	}
	return [...byGroup.entries()]
		.map(([title, set]) => ({ title, names: [...set].sort((a, b) => a.localeCompare(b)) }))
		.filter(g => g.names.length);
}

function blockText(title, names, prefix) {
	return `┏━━━『 ${title} 』━━━┓\n${names.map(n => `✦ ${prefix}${n}`).join("  ")}\n┗━━━━━━━━━━━━━━━━━━┛`;
}

// split one oversized category into several blocks that each fit a message
function blocksFor(group, prefix) {
	const full = blockText(group.title, group.names, prefix);
	if (full.length <= MAX_LEN) return [full];
	const out = [];
	let cur = [];
	for (const n of group.names) {
		const test = blockText(group.title, [...cur, n], prefix);
		if (test.length > MAX_LEN && cur.length) {
			out.push(blockText(group.title + (out.length ? " (cont.)" : ""), cur, prefix));
			cur = [];
		}
		cur.push(n);
	}
	if (cur.length) out.push(blockText(group.title + " (cont.)", cur, prefix));
	return out;
}

function buildPages(commands, role, prefix) {
	const groups = collect(commands, role);
	const total = groups.reduce((s, g) => s + g.names.length, 0);
	const target = Math.max(1, total / PAGES);

	// keep category order, cut into 3 pages of roughly equal command count
	const pageGroups = Array.from({ length: PAGES }, () => []);
	let done = 0;
	for (const g of groups) {
		const page = Math.min(PAGES - 1, Math.floor((done + g.names.length / 2) / target));
		pageGroups[page].push(g);
		done += g.names.length;
	}

	return pageGroups.map((list, i) => {
		const blocks = list.flatMap(g => blocksFor(g, prefix));
		const head = `${TITLE}\nPAGE ${i + 1}/${PAGES}`;
		const foot = i < PAGES - 1
			? `Total: ${total} commands\nNext: ${prefix}help${i + 2}`
			: `Total: ${total} commands\n${prefix}help <command> for details`;
		const messages = [];
		let cur = head;
		for (const b of blocks) {
			if (cur.length + b.length + 2 > MAX_LEN) {
				messages.push(cur);
				cur = b;
			}
			else cur += "\n\n" + b;
		}
		cur += `\n\n${foot}`;
		messages.push(cur);
		if (!blocks.length) return [`${head}\n\n(no commands on this page)\n\n${foot}`];
		return messages;
	});
}

module.exports = { buildPages, GROUPS };
