// set bash title
process.stdout.write("\x1b]2;GoatBot IG - Instagram edition of GoatBot V2\x1b\x5c");
const defaultRequire = require;

function decode(text) {
	text = Buffer.from(text, 'hex').toString('utf-8');
	text = Buffer.from(text, 'hex').toString('utf-8');
	text = Buffer.from(text, 'base64').toString('utf-8');
	return text;
}

const gradient = defaultRequire("gradient-string").default || defaultRequire("gradient-string");
const axios = defaultRequire("axios");
const path = defaultRequire("path");
const readline = defaultRequire("readline");
const fs = defaultRequire("fs-extra");
const login = defaultRequire("@lazyneoaz/ig-chat-api");

async function getIGUsername(userID) {
	try {
		const info = await global.GoatBot.fcaApi.getUserInfo(userID);
		return info && info[userID] ? (info[userID].name || info[userID].username || null) : null;
	}
	catch (error) {
		return null;
	}
}


function compareVersion(version1, version2) {
	const v1 = version1.split(".");
	const v2 = version2.split(".");
	for (let i = 0; i < 3; i++) {
		if (parseInt(v1[i]) > parseInt(v2[i]))
			return 1; // version1 > version2
		if (parseInt(v1[i]) < parseInt(v2[i]))
			return -1; // version1 < version2
	}
	return 0; // version1 = version2
}

const { writeFileSync, readFileSync, existsSync, watch } = require("fs-extra");
const handlerWhenListenHasError = require("./handlerWhenListenHasError.js");
const checkLiveCookie = require("./checkLiveCookie.js");
const { callbackListenTime, storage5Message } = global.GoatBot;
const { log, logColor, getPrefix, createOraDots, jsonStringifyColor, getText, convertTime, colors, randomString } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const currentVersion = require(`${process.cwd()}/package.json`).version;

function centerText(text, length) {
	const width = process.stdout.columns;
	const leftPadding = Math.floor((width - (length || text.length)) / 2);
	const rightPadding = width - leftPadding - (length || text.length);
	// Build the padded string using the calculated padding values
	const paddedString = ' '.repeat(leftPadding > 0 ? leftPadding : 0) + text + ' '.repeat(rightPadding > 0 ? rightPadding : 0);
	// Print the padded string to the terminal
	console.log(paddedString);
}

// logo
const titles = [
	[
		"██████╗  ██████╗  █████╗ ████████╗    ██╗   ██╗██████╗",
		"██╔════╝ ██╔═══██╗██╔══██╗╚══██╔══╝    ██║   ██║╚════██╗",
		"██║  ███╗██║   ██║███████║   ██║       ██║   ██║ █████╔╝",
		"██║   ██║██║   ██║██╔══██║   ██║       ╚██╗ ██╔╝██╔═══╝",
		"╚██████╔╝╚██████╔╝██║  ██║   ██║        ╚████╔╝ ███████╗",
		"╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ╚═╝         ╚═══╝  ╚══════╝"
	],
	[
		"█▀▀ █▀█ ▄▀█ ▀█▀  █▄▄ █▀█ ▀█▀  █░█ ▀█",
		"█▄█ █▄█ █▀█ ░█░  █▄█ █▄█ ░█░  ▀▄▀ █▄"
	],
	[
		"G O A T B O T  I G @" + currentVersion
	],
	[
		"GOATBOT IG"
	]
];
const maxWidth = process.stdout.columns;
const title = maxWidth > 58 ?
	titles[0] :
	maxWidth > 36 ?
		titles[1] :
		maxWidth > 26 ?
			titles[2] :
			titles[3];

console.log(gradient("#f5af19", "#f12711")(createLine(null, true)));
console.log();
console.log(gradient("#FA8BFF", "#2BD2FF", "#2BFF88")( 
	"██╗ ██████╗         ██████╗██╗  ██╗ █████╗ ████████╗        █████╗ ██████╗ ██╗\n" +
	"██║██╔════╝        ██╔════╝██║  ██║██╔══██╗╚══██╔══╝       ██╔══██╗██╔══██╗██║\n" +
	"██║██║  ███╗██████╗██║     ███████║███████║   ██║   ██████╗███████║██████╔╝██║\n" +
	"██║██║   ██║╚═════╝██║     ██╔══██║██╔══██║   ██║   ╚═════╝██╔══██║██╔═══╝ ██║\n" +
	"██║╚██████╔╝       ╚██████╗██║  ██║██║  ██║   ██║          ██║  ██║██║     ██║\n" +
	"╚═╝ ╚═════╝         ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝          ╚═╝  ╚═╝╚═╝     ╚═╝\n"
));
console.log();
for (const text of title) {
	const textColor = gradient("#FA8BFF", "#2BD2FF", "#2BFF88")(text);
	centerText(textColor, text.length);
}
let subTitle = `GoatBot IG@${currentVersion} - An Instagram Direct chat bot use personal account`;
const subTitleArray = [];
if (subTitle.length > maxWidth) {
	while (subTitle.length > maxWidth) {
		let lastSpace = subTitle.slice(0, maxWidth).lastIndexOf(' ');
		lastSpace = lastSpace == -1 ? maxWidth : lastSpace;
		subTitleArray.push(subTitle.slice(0, lastSpace).trim());
		subTitle = subTitle.slice(lastSpace).trim();
	}
	subTitle ? subTitleArray.push(subTitle) : '';
}
else {
	subTitleArray.push(subTitle);
}
const author = ("Messenger edition, GoatBot V2: NTKhang | Instagram edition: lazyneoaz (Saifullah Al Neoaz)");
const srcUrl = ("Source: https://github.com/imneoazbro/Goat-Bot-IG (forked from ntkhang03/Goat-Bot-V2)");
const fakeRelease = ("ALL VERSIONS NOT RELEASED HERE ARE FAKE");
for (const t of subTitleArray) {
	const textColor2 = gradient("#9F98E8", "#AFF6CF")(t);
	centerText(textColor2, t.length);
}
centerText(gradient("#9F98E8", "#AFF6CF")(author), author.length);
centerText(gradient("#9F98E8", "#AFF6CF")(srcUrl), srcUrl.length);
centerText(gradient("#f5af19", "#f12711")(fakeRelease), fakeRelease.length);

let widthConsole = process.stdout.columns;
if (widthConsole > 50)
	widthConsole = 50;

function createLine(content, isMaxWidth = false) {
	if (!content)
		return Array(isMaxWidth ? process.stdout.columns : widthConsole).fill("─").join("");
	else {
		content = ` ${content.trim()} `;
		const lengthContent = content.length;
		const lengthLine = isMaxWidth ? process.stdout.columns - lengthContent : widthConsole - lengthContent;
		let left = Math.floor(lengthLine / 2);
		if (left < 0 || isNaN(left))
			left = 0;
		const lineOne = Array(left).fill("─").join("");
		return lineOne + content + lineOne;
	}
}

const character = createLine();

const clearLines = (n) => {
	for (let i = 0; i < n; i++) {
		const y = i === 0 ? null : -1;
		process.stdout.moveCursor(0, y);
		process.stdout.clearLine(1);
	}
	process.stdout.cursorTo(0);
	process.stdout.write('');
};

async function input(prompt, isPassword = false) {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	if (isPassword)
		rl.input.on("keypress", function () {
			// get the number of characters entered so far:
			const len = rl.line.length;
			// move cursor back to the beginning of the input:
			readline.moveCursor(rl.output, -len, 0);
			// clear everything to the right of the cursor:
			readline.clearLine(rl.output, 1);
			// replace the original input with asterisks:
			for (let i = 0; i < len; i++) {
				rl.output.write("*");
			}
		});

	return new Promise(resolve => rl.question(prompt, ans => {
		rl.close();
		resolve(ans);
	}));
}

const { dirAccount } = global.client;
// const { config, configCommands } = global.GoatBot;
const instagramAccount = global.GoatBot.config.instagramAccount || {};

function responseUptimeSuccess(req, res) {
	res.type('json').send({
		status: "success",
		uptime: process.uptime(),
		unit: "seconds"
	});
}

function responseUptimeError(req, res) {
	res.status(500).type('json').send({
		status: "error",
		uptime: process.uptime(),
		statusAccountBot: global.statusAccountBot
	});
}

function checkAndTrimString(string) {
	if (typeof string == "string")
		return string.trim();
	return string;
}

function filterKeysAppState(appState) {
	if (!Array.isArray(appState))
		return [];
	return appState.filter(item => ["sessionid", "ds_user_id", "csrftoken", "mid", "ig_did", "datr", "rur", "authorization"].includes(item.key));
}

global.responseUptimeCurrent = responseUptimeSuccess;
global.responseUptimeSuccess = responseUptimeSuccess;
global.responseUptimeError = responseUptimeError;

global.statusAccountBot = 'good';
let changeSessionByCode = false;
let latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
let dashBoardIsRunning = false;


function isNetScapeCookie(cookie) {
	if (typeof cookie !== 'string')
		return false;
	return /(.+)\t(1|TRUE|true)\t([\w\/.-]*)\t(1|TRUE|true)\t\d+\t([\w-]+)\t(.+)/i.test(cookie);
	// match
}

function netScapeToCookies(cookieData) {
	const cookies = [];
	const lines = cookieData.split('\n');
	lines.forEach((line) => {
		if (line.trim().startsWith('#')) {
			return;
		}
		const fields = line.split('\t').map((field) => field.trim()).filter((field) => field.length > 0);
		if (fields.length < 7) {
			return;
		}
		const cookie = {
			key: fields[5],
			value: fields[6],
			domain: fields[0],
			path: fields[2],
			hostOnly: fields[1] === 'TRUE',
			creation: new Date(fields[4] * 1000).toISOString(),
			lastAccessed: new Date().toISOString()
		};
		cookies.push(cookie);
	});
	return cookies;
}

let spin;
async function getAppStateToLogin() {
	let appState = [];
	if (!existsSync(dirAccount))
		return log.error("LOGIN INSTAGRAM", getText('login', 'notFoundDirAccount', colors.green(dirAccount)));
	const accountText = readFileSync(dirAccount, "utf8").trim();
	if (!accountText)
		return log.error("LOGIN INSTAGRAM", getText('login', 'notFoundDirAccount', colors.green(dirAccount)));

	try {
		// Cookie string: "sessionid=...; ds_user_id=..." (browser devtools format)
		if (accountText.match(/^(?:\s*\w+\s*=\s*[^;]*;?)+/)) {
			spin = createOraDots(getText('login', 'loginCookieString'));
			spin._start();
			appState = accountText.split(';')
				.map(i => {
					const idx = i.indexOf('=');
					return {
						key: (i.slice(0, idx) || "").trim(),
						value: (i.slice(idx + 1) || "").trim(),
						domain: "instagram.com",
						path: "/",
						hostOnly: true,
						creation: new Date().toISOString(),
						lastAccessed: new Date().toISOString()
					};
				})
				.filter(i => i.key && i.value && i.key != "x-referer");
		}
		// Netscape cookies.txt export
		else if (isNetScapeCookie(accountText)) {
			spin = createOraDots(getText('login', 'loginCookieNetscape'));
			spin._start();
			appState = netScapeToCookies(accountText);
		}
		// JSON appState array (IG or GoatBot style: {key,value} or {name,value})
		else {
			try {
				spin = createOraDots(getText('login', 'loginCookieArray'));
				spin._start();
				appState = JSON.parse(accountText);
			}
			catch (err) {
				const error = new Error(`${path.basename(dirAccount)} is invalid`);
				error.name = "ACCOUNT_ERROR";
				throw error;
			}
			if (!Array.isArray(appState)) {
				const error = new Error(`${path.basename(dirAccount)} is invalid`);
				error.name = "ACCOUNT_ERROR";
				throw error;
			}
			if (appState.some(i => i.name))
				appState = appState.map(i => {
					i.key = i.name;
					delete i.name;
					return i;
				});
			else if (!appState.some(i => i.key)) {
				const error = new Error(`${path.basename(dirAccount)} is invalid`);
				error.name = "ACCOUNT_ERROR";
				throw error;
			}
			appState = appState
				.map(item => ({
					...item,
					domain: "instagram.com",
					path: "/",
					hostOnly: false,
					creation: new Date().toISOString(),
					lastAccessed: new Date().toISOString()
				}))
				.filter(i => i.key && i.value && i.key != "x-referer");
		}
		if (!await checkLiveCookie(appState)) {
			const error = new Error("Cookie is invalid");
			error.name = "COOKIE_INVALID";
			throw error;
		}
	}
	catch (err) {
		spin && spin._stop();
		if (err.name === "COOKIE_INVALID")
			log.err("LOGIN INSTAGRAM", getText('login', 'cookieError'));
		else if (err.name === "ACCOUNT_ERROR")
			log.err("LOGIN INSTAGRAM", getText('login', 'accountError', colors.green("sessionid"), colors.green("ds_user_id")));

		log.warn("LOGIN INSTAGRAM", getText('login', 'cannotFindAccount'));
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		const options = [
			getText('login', 'chooseCookieString'),
			getText('login', 'chooseCookieArray')
		];
		let currentOption = 0;
		await new Promise((resolve) => {
			const character = '>';
			function showOptions() {
				rl.output.write(`\r${options.map((option, index) => index === currentOption ? colors.blueBright(`${character} (${index + 1}) ${option}`) : `  (${index + 1}) ${option}`).join('\n')}\u001B`);
				rl.write('\u001B[?25l'); // hides cursor
			}
			rl.input.on('keypress', (_, key) => {
				if (key.name === 'up') {
					currentOption = (currentOption - 1 + options.length) % options.length;
				}
				else if (key.name === 'down') {
					currentOption = (currentOption + 1) % options.length;
				}
				else if (!isNaN(key.name)) {
					const number = parseInt(key.name);
					if (number >= 0 && number <= options.length)
						currentOption = number - 1;
					process.stdout.write('\033[1D'); // delete the character
				}
				else if (key.name === 'enter' || key.name === 'return') {
					rl.input.removeAllListeners('keypress');
					rl.close();
					clearLines(options.length + 1);
					showOptions();
					resolve();
				}
				else {
					process.stdout.write('\033[1D'); // delete the character
				}

				clearLines(options.length);
				showOptions();
			});
			showOptions();
		});

		rl.write('\u001B[?25h\n'); // show cursor
		clearLines(options.length + 1);
		log.info("LOGIN INSTAGRAM", getText('login', 'loginWith', options[currentOption]));

		if (currentOption == 0) {
			const cookie = await input(getText('login', 'inputCookieString') + " ");
			writeFileSync(global.client.dirAccount, cookie);
		}
		else {
			const cookie = await input(getText('login', 'inputCookieArray') + " ");
			writeFileSync(global.client.dirAccount, JSON.stringify(JSON.parse(cookie), null, 2));
		}
		return await getAppStateToLogin();
	}
	return appState;
}

function stopListening(keyListen) {
	keyListen = keyListen || Object.keys(callbackListenTime).pop();
	return new Promise((resolve) => {
		global.GoatBot.fcaApi.stopListening?.(() => {
			if (callbackListenTime[keyListen]) {
				// callbackListenTime[keyListen || Object.keys(callbackListenTime).pop()]("Connection closed by user.");
				callbackListenTime[keyListen] = () => { };
			}
			resolve();
		}) || resolve();
	});
}

// function removeListener(keyListen) {
// 	keyListen = keyListen || Object.keys(callbackListenTime).pop();
// 	if (callbackListenTime[keyListen])
// 		callbackListenTime[keyListen] = () => { };
// }

async function startBot() {
	console.log(colors.hex("#f5ab00")(createLine("START LOGGING IN", true)));
	const currentVersion = require("../../package.json").version;

	if (global.GoatBot.Listening)
		await stopListening();

	log.info("LOGIN INSTAGRAM", getText('login', 'currentlyLogged'));

	let appState = await getAppStateToLogin();
	if (!Array.isArray(appState) || !appState.some(i => i.key === "sessionid")) {
		log.error("LOGIN INSTAGRAM", getText('login', 'notFoundDirAccount', colors.green(dirAccount)));
		process.exit(0);
	}
	changeSessionByCode = true;
	appState = filterKeysAppState(appState);
	writeFileSync(dirAccount, JSON.stringify(appState, null, 2));
	setTimeout(() => changeSessionByCode = false, 1000);
	// ——————————————————— LOGIN ———————————————————— //
	(function loginBot(appState) {
		global.GoatBot.commands = new Map();
		global.GoatBot.eventCommands = new Map();
		global.GoatBot.aliases = new Map();
		global.GoatBot.onChat = [];
		global.GoatBot.onEvent = [];
		global.GoatBot.onReply = new Map();
		global.GoatBot.onReaction = new Map();
		clearInterval(global.intervalRestartListenMqtt);
		delete global.intervalRestartListenMqtt;

		let isSendNotiErrorMessage = false;

		login({ appState }, global.GoatBot.config.optionsFca, async function (error, api) {
			spin ? spin._stop() : null;

			// Handle error
			if (error) {
				log.err("LOGIN INSTAGRAM", getText('login', 'loginError'), error);
				global.statusAccountBot = 'can\'t login';
				// —————————— CHECK DASHBOARD —————————— //
				if (global.GoatBot.config.dashBoard?.enable == true) {
					try {
						await require("../../dashboard/app.js")(null);
						log.info("DASHBOARD", getText('login', 'openDashboardSuccess'));
					}
					catch (err) {
						log.err("DASHBOARD", getText('login', 'openDashboardError'), err);
					}
					return;
				}
				else {
					process.exit();
				}
			}

			global.GoatBot.fcaApi = api;
			global.GoatBot.botID = api.getCurrentUserID();
			log.info("LOGIN INSTAGRAM", getText('login', 'loginSuccess'));
			global.botID = api.getCurrentUserID();
			logColor("#f5ab00", createLine("BOT INFO"));
			log.info("NODE VERSION", process.version);
			log.info("PROJECT VERSION", currentVersion);
			log.info("BOT ID", `${global.botID} - ${await getIGUsername(global.botID)}`);
			log.info("PREFIX", global.GoatBot.config.prefix);
			log.info("LANGUAGE", global.GoatBot.config.language);
			log.info("BOT NICK NAME", global.GoatBot.config.nickNameBot || "GOAT BOT");
			// ———————————————————— GBAN ————————————————————— //
			// The upstream GBAN list is keyed by Facebook numeric uids. An Instagram
			// account id can collide with one of those uids, and the check also
			// hard-exits the bot when GitHub is unreachable. It is therefore
			// disabled unless explicitly enabled with `gbanCheck: true`.
			let dataGban = {};
			let hasBanned = false;
			if (global.GoatBot.config.gbanCheck === true) {
				try {
					dataGban = (await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2-Gban/master/gban.json")).data;
				}
				catch (e) {
					log.err('GBAN', getText('login', 'checkGbanError'));
					dataGban = {};
				}
			}
			{
				// ————————————————— CHECK BOT ————————————————— //
				const botID = api.getCurrentUserID();
				if (dataGban.hasOwnProperty(botID) && !dataGban[botID].toDate) {
					log.err('GBAN', getText('login', 'gbanMessage', dataGban[botID].date, dataGban[botID].reason, dataGban[botID].date));
					hasBanned = true;
				}
				// ———————————————— CHECK ADMIN ———————————————— //
				for (const idad of global.GoatBot.config.adminBot) {
					if (dataGban.hasOwnProperty(idad) && !dataGban[idad].toDate) {
						log.err('GBAN', getText('login', 'gbanMessage', dataGban[idad].date, dataGban[idad].reason, dataGban[idad].date));
						hasBanned = true;
					}
				}
				if (hasBanned == true)
					process.exit();
			}
			// ———————————————— NOTIFICATIONS ———————————————— //
			let notification;
			try {
				notification = (await axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2-Gban/master/notification.txt")).data;
			}
			catch (err) {
				notification = "";
			}

			if (global.GoatBot.config.autoRefreshSession == true) {
				changeSessionByCode = true;
				try {
					writeFileSync(dirAccount, JSON.stringify(filterKeysAppState(api.getAppState()), null, 2));
					log.info("REFRESH SESSION", getText('login', 'refreshSessionSuccess', path.basename(dirAccount)));
				}
				catch (err) {
					log.warn("REFRESH SESSION", getText('login', 'refreshSessionError', path.basename(dirAccount)), err);
				}
				setTimeout(() => changeSessionByCode = false, 1000);
			}
			if (hasBanned == true) {
				log.err('GBAN', getText('login', 'youAreBanned'));
				process.exit();
			}
			// ——————————————————— LOAD DATA ——————————————————— //
			const { threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, sequelize } = await require(global.utils.resolveOptionalModule(__dirname, "loadData"))(api, createLine);
			// ————————————————— CUSTOM SCRIPTS ————————————————— //
			await require("../custom.js")({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getText });
			// —————————————————— LOAD SCRIPTS —————————————————— //
			await require(global.utils.resolveOptionalModule(__dirname, "loadScripts"))(api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, createLine);
			// ———————————— CHECK AUTO LOAD SCRIPTS ———————————— //
			if (global.GoatBot.config.autoLoadScripts?.enable == true) {
				const ignoreCmds = global.GoatBot.config.autoLoadScripts.ignoreCmds?.replace(/[ ,]+/g, ' ').trim().split(' ') || [];
				const ignoreEvents = global.GoatBot.config.autoLoadScripts.ignoreEvents?.replace(/[ ,]+/g, ' ').trim().split(' ') || [];

				watch(`${process.cwd()}/scripts/cmds`, async (event, filename) => {
					if (filename.endsWith('.js')) {
						if (ignoreCmds.includes(filename) || filename.endsWith('.eg.js'))
							return;
						if ((event == 'change' || event == 'rename') && existsSync(`${process.cwd()}/scripts/cmds/${filename}`)) {
							try {
								const contentCommand = global.temp.contentScripts.cmds[filename] || "";
								const currentContent = readFileSync(`${process.cwd()}/scripts/cmds/${filename}`, 'utf-8');
								if (contentCommand == currentContent)
									return;
								global.temp.contentScripts.cmds[filename] = currentContent;
								filename = filename.replace('.js', '');

								const infoLoad = global.utils.loadScripts("cmds", filename, log, global.GoatBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData);
								if (infoLoad.status == "success")
									log.master("AUTO LOAD SCRIPTS", `Command ${filename}.js (${infoLoad.command.config.name}) has been reloaded`);
								else
									log.err("AUTO LOAD SCRIPTS", `Error when reload command ${filename}.js`, infoLoad.error);
							}
							catch (err) {
								log.err("AUTO LOAD SCRIPTS", `Error when reload command ${filename}.js`, err);
							}
						}
					}
				});

				watch(`${process.cwd()}/scripts/events`, async (event, filename) => {
					if (filename.endsWith('.js')) {
						if (ignoreEvents.includes(filename) || filename.endsWith('.eg.js'))
							return;
						if ((event == 'change' || event == 'rename') && existsSync(`${process.cwd()}/scripts/events/${filename}`)) {
							try {
								const contentEvent = global.temp.contentScripts.events[filename] || "";
								const currentContent = readFileSync(`${process.cwd()}/scripts/events/${filename}`, 'utf-8');
								if (contentEvent == currentContent)
									return;
								global.temp.contentScripts.events[filename] = currentContent;
								filename = filename.replace('.js', '');

								const infoLoad = global.utils.loadScripts("events", filename, log, global.GoatBot.configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData);
								if (infoLoad.status == "success")
									log.master("AUTO LOAD SCRIPTS", `Event ${filename}.js (${infoLoad.command.config.name}) has been reloaded`);
								else
									log.err("AUTO LOAD SCRIPTS", `Error when reload event ${filename}.js`, infoLoad.error);
							}
							catch (err) {
								log.err("AUTO LOAD SCRIPTS", `Error when reload event ${filename}.js`, err);
							}
						}
					}
				});
			}
			// ——————————————————— DASHBOARD ——————————————————— //
			if (global.GoatBot.config.dashBoard?.enable == true && dashBoardIsRunning == false) {
				logColor('#f5ab00', createLine('DASHBOARD'));
				try {
					await require("../../dashboard/app.js")(api);
					log.info("DASHBOARD", getText('login', 'openDashboardSuccess'));
					dashBoardIsRunning = true;
				}
				catch (err) {
					log.err("DASHBOARD", getText('login', 'openDashboardError'), err);
				}
			}
			// ———————————————————— ADMIN BOT ———————————————————— //
			logColor('#f5ab00', character);
			let i = 0;
			const adminBot = global.GoatBot.config.adminBot
				.filter(item => !isNaN(item))
				.map(item => item = item.toString());
			for (const uid of adminBot) {
				try {
					const userName = await usersData.getName(uid);
					log.master("ADMINBOT", `[${++i}] ${uid} | ${userName}`);
				}
				catch (e) {
					log.master("ADMINBOT", `[${++i}] ${uid}`);
				}
			}
			log.master("NOTIFICATION", (notification || "").trim());
			log.master("SUCCESS", getText('login', 'runBot'));
			log.master("LOAD TIME", `${convertTime(Date.now() - global.GoatBot.startTime)}`);
			logColor("#f5ab00", createLine("COPYRIGHT"));
			// —————————————————— COPYRIGHT INFO —————————————————— //
			// console.log(`\x1b[1m\x1b[33mCOPYRIGHT:\x1b[0m\x1b[1m\x1b[37m \x1b[0m\x1b[1m\x1b[36mProject GoatBot v2 created by ntkhang03 (https://github.com/ntkhang03), please do not sell this source code or claim it as your own. Thank you!\x1b[0m`);
			console.log(`\x1b[1m\x1b[33m${("COPYRIGHT:")}\x1b[0m\x1b[1m\x1b[37m \x1b[0m\x1b[1m\x1b[36m${("Project GoatBot v2 created by ntkhang03 (https://github.com/ntkhang03), please do not sell this source code or claim it as your own. Thank you!")}\x1b[0m`);
			logColor("#f5ab00", character);
			global.GoatBot.config.adminBot = adminBot;
			writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			writeFileSync(global.client.dirConfigCommands, JSON.stringify(global.GoatBot.configCommands, null, 2));

			// ——————————————————————————————————————————————————— //
			const { restartListenMqtt } = global.GoatBot.config;
			let intervalCheckLiveCookieAndRelogin = false;
			// —————————————————— CALLBACK LISTEN —————————————————— //
			async function callBackListen(error, event) {
				if (error) {
					global.responseUptimeCurrent = responseUptimeError;
					if (
						error.error == "Not logged in" ||
						error.error == "Not logged in." ||
						error.error == "Connection refused: Server unavailable"
					) {
						log.err("NOT LOGGEG IN", getText('login', 'notLoggedIn'), error);
						global.responseUptimeCurrent = responseUptimeError;
						global.statusAccountBot = 'can\'t login';
						if (!isSendNotiErrorMessage) {
							await handlerWhenListenHasError({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, error });
							isSendNotiErrorMessage = true;
						}

						if (global.GoatBot.config.autoRestartWhenListenMqttError)
							process.exit(2);
						else {
							// log.dev("ACCOUNT LOCKED, start relogin...");
							// await stopListening();
							// log.dev("STOP LISTENING SUCCESS");
							const keyListen = Object.keys(callbackListenTime).pop();
							if (callbackListenTime[keyListen])
								callbackListenTime[keyListen] = () => { };

							let times = 5;

							const spin = createOraDots(getText('login', 'retryCheckLiveCookie', times));
							const countTimes = setInterval(() => {
								times--;
								if (times == 0)
									times = 5;
								spin.text = getText('login', 'retryCheckLiveCookie', times);
							}, 1000);

							if (intervalCheckLiveCookieAndRelogin == false) {
								intervalCheckLiveCookieAndRelogin = true;
								const interval = setInterval(async () => {
									const cookieIsLive = await checkLiveCookie(appState);
									if (cookieIsLive) {
										clearInterval(interval);
										clearInterval(countTimes);
										intervalCheckLiveCookieAndRelogin = false;
										const keyListen = Date.now();
										isSendNotiErrorMessage = false;
										global.GoatBot.Listening = api.listenMqtt(createCallBackListen(keyListen));
									}
								}, 5000);
							}
						}
						return;
					}
					else if (error == "Connection closed." || error == "Connection closed by user.") /* by stopListening; */ {
						return;
					}
					else {
						await handlerWhenListenHasError({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, error });
						return log.err("LISTEN_MQTT", getText('login', 'callBackError'), error);
					}
				}
				global.responseUptimeCurrent = responseUptimeSuccess;
				global.statusAccountBot = 'good';
				const configLog = global.GoatBot.config.logEvents;
				if (isSendNotiErrorMessage == true)
					isSendNotiErrorMessage = false;

				// "whiteListMode": {
				// 	"enable": false,
				// 	"whiteListIds": [],
				// 	"notes": "if you enable this feature, only the ids in the whiteListIds list can use the bot"
				// },
				// "whiteListModeThread": {
				// 	"enable": false,
				// 	"whiteListThreadIds": [],
				// 	"notes": "if you enable this feature, only the thread in the whiteListThreadIds list can use the bot",
				// 	"how_it_work": "if you enable both whiteListMode and whiteListModeThread, the system will check if the user is in whiteListIds, then check if the thread is in whiteListThreadIds, if one of the conditions is true, the user can use the bot"
				// },

				// "if you enable both whiteListMode and whiteListModeThread, the system will check if the user is in whiteListIds, then check if the thread is in whiteListThreadIds, if one of the conditions is true, the user can use the bot"
				// const whitelistMode = config.whiteListMode?.enable === true;
				// const whitelistModeThread = config.whiteListModeThread?.enable === true;
				// const isWhitelistedSender = config.whiteListMode?.whiteListIds.includes(event.senderID);
				// const isWhitelistedThread = config.whiteListModeThread?.whiteListThreadIds.includes(event.threadID);

				// if (
				// 	(whitelistMode && whitelistModeThread && !isWhitelistedSender && !isWhitelistedThread) ||
				// 	(whitelistMode && !isWhitelistedSender) ||
				// 	(whitelistModeThread && !isWhitelistedThread)
				// ) {
				// 	return;
				// }

				if (
					global.GoatBot.config.whiteListMode?.enable == true
					&& global.GoatBot.config.whiteListModeThread?.enable == true
					// admin
					&& !global.GoatBot.config.adminBot.includes(event.senderID)
				) {
					if (
						!global.GoatBot.config.whiteListMode.whiteListIds.includes(event.senderID)
						&& !global.GoatBot.config.whiteListModeThread.whiteListThreadIds.includes(event.threadID)
						// admin
						&& !global.GoatBot.config.adminBot.includes(event.senderID)
					)
						return;
				}
				else if (
					global.GoatBot.config.whiteListMode?.enable == true
					&& !global.GoatBot.config.whiteListMode.whiteListIds.includes(event.senderID)
					// admin
					&& !global.GoatBot.config.adminBot.includes(event.senderID)
				)
					return;
				else if (
					global.GoatBot.config.whiteListModeThread?.enable == true
					&& !global.GoatBot.config.whiteListModeThread.whiteListThreadIds.includes(event.threadID)
					// admin
					&& !global.GoatBot.config.adminBot.includes(event.senderID)
				)
					return;

				// check if listenMqtt loop
				if (event.messageID && event.type == "message") {
					if (storage5Message.includes(event.messageID))
						Object.keys(callbackListenTime).slice(0, -1).forEach(key => {
							callbackListenTime[key] = () => { };
						});
					else
						storage5Message.push(event.messageID);
					if (storage5Message.length > 5)
						storage5Message.shift();
				}

				if (configLog.disableAll === false && configLog[event.type] !== false) {
					// hide participantIDs (it is array too long)
					const participantIDs_ = [...event.participantIDs || []];
					if (event.participantIDs)
						event.participantIDs = 'Array(' + event.participantIDs.length + ')';

					console.log(colors.green((event.type || "").toUpperCase() + ":"), jsonStringifyColor(event, null, 2));

					if (event.participantIDs)
						event.participantIDs = participantIDs_;
				}

				if ((event.senderID && dataGban[event.senderID] || event.userID && dataGban[event.userID])) {
					if (event.body && event.threadID) {
						const prefix = getPrefix(event.threadID);
						if (event.body.startsWith(prefix))
							return api.sendMessage(getText('login', 'userBanned'), event.threadID);
						return;
					}
					else
						return;
				}

				const handlerAction = require("../handler/handlerAction.js")(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

				if (hasBanned === false)
					handlerAction(event);
				else
					return log.err('GBAN', getText('login', 'youAreBanned'));
			}
			// ————————————————— CREATE CALLBACK ————————————————— //
			function createCallBackListen(key) {
				key = randomString(10) + (key || Date.now());
				callbackListenTime[key] = callBackListen;
				return function (error, event) {
					callbackListenTime[key](error, event);
				};
			}
			// ———————————————————— START BOT ———————————————————— //
			await stopListening();
			global.GoatBot.Listening = api.listenMqtt(createCallBackListen());
			global.GoatBot.callBackListen = callBackListen;
			// ——————————————————— UPTIME ——————————————————— //
			if (global.GoatBot.config.serverUptime.enable == true && !global.GoatBot.config.dashBoard?.enable && !global.serverUptimeRunning) {
				const http = require('http');
				const express = require('express');
				const app = express();
				const server = http.createServer(app);
				const { data: html } = await axios.get("https://raw.githubusercontent.com/ntkhang03/resources-goat-bot/master/homepage/home.html").catch(() => ({}));
				// Bind the host-assigned port when present (see dashboard/app.js).
				const PORT = process.env.PORT || global.GoatBot.config.dashBoard?.port || (!isNaN(global.GoatBot.config.serverUptime.port) && global.GoatBot.config.serverUptime.port) || 3001;
				const homepage = html || "<!DOCTYPE html><html><head><title>Goat Bot IG</title></head><body style=\"font-family:sans-serif;text-align:center;margin-top:12vh\"><h1>Goat Bot IG is online</h1><p>Instagram edition by lazyneoaz \u2014 <a href=\"https://github.com/lazyneoaz\">github.com/lazyneoaz</a></p></body></html>";
				app.get('/', (req, res) => res.send(homepage));
				app.get('/uptime', global.responseUptimeCurrent);
				let nameUpTime;
				try {
					nameUpTime = process.env.RENDER_EXTERNAL_URL ||
						(process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : "") ||
						`https://${process.env.REPL_OWNER ?
							`${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` :
							process.env.API_SERVER_EXTERNAL == "https://api.glitch.com" ?
								`${process.env.PROJECT_DOMAIN}.glitch.me` :
								(process.env.PORT ? `localhost` : `localhost:${PORT}`)}`;
					nameUpTime.includes('localhost') && (nameUpTime = nameUpTime.replace('https', 'http'));
					server.on('error', (err) => log.err("UPTIME", getText('login', 'openServerUptimeError'), err));
					await server.listen(PORT);
					log.info("UPTIME", getText('login', 'openServerUptimeSuccess', nameUpTime));
					if (global.GoatBot.config.serverUptime.socket?.enable == true)
						require('./socketIO.js')(server);
					global.serverUptimeRunning = true;
				}
				catch (err) {
					log.err("UPTIME", getText('login', 'openServerUptimeError'), err);
				}
			}


			// ———————————————————— RESTART LISTEN ———————————————————— //
			if (restartListenMqtt.enable == true) {
				if (restartListenMqtt.logNoti == true) {
					log.info("LISTEN_MQTT", getText('login', 'restartListenMessage', convertTime(restartListenMqtt.timeRestart, true)));
					log.info("BOT_STARTED", getText('login', 'startBotSuccess'));

					logColor("#f5ab00", character);
				}
				const restart = setInterval(async function () {
					if (restartListenMqtt.enable == false) {
						clearInterval(restart);
						return log.warn("LISTEN_MQTT", getText('login', 'stopRestartListenMessage'));
					}
					try {
						await stopListening();
						await sleep(1000);
						global.GoatBot.Listening = api.listenMqtt(createCallBackListen());
						log.info("LISTEN_MQTT", getText('login', 'restartListenMessage2'));
					}
					catch (e) {
						log.err("LISTEN_MQTT", getText('login', 'restartListenMessageError'), e);
					}
				}, restartListenMqtt.timeRestart);
				global.intervalRestartListenMqtt = restart;
			}
			require('../autoUptime.js');
		});
	})(appState);

	if (global.GoatBot.config.autoReloginWhenChangeAccount) {
		setTimeout(function () {
			watch(dirAccount, async (type) => {
				if (type == 'change' && changeSessionByCode == false && latestChangeContentAccount != fs.statSync(dirAccount).mtimeMs) {
					clearInterval(global.intervalRestartListenMqtt);
					global.compulsoryStopLisening = true;
					// await stopListening();
					latestChangeContentAccount = fs.statSync(dirAccount).mtimeMs;
					// process.exit(2);
					startBot();
				}
			});
		}, 10000);
	}
}

global.GoatBot.reLoginBot = startBot;
startBot();
