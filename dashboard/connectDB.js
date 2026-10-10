const path = require("path");

const fs = require("fs");
// The `.dev.json` overrides are optional; fall back to the regular files when
// they are missing so a production deploy can boot.
function resolveConfigPath(baseDir, baseName) {
        const useDev = ['production', 'development'].includes(process.env.NODE_ENV);
        const candidates = useDev
                ? [`${baseName}.dev.json`, `${baseName}.json`]
                : [`${baseName}.json`, `${baseName}.dev.json`];
        for (const name of candidates) {
                const fullPath = path.join(baseDir, name);
                if (fs.existsSync(fullPath))
                        return fullPath;
        }
        return path.join(baseDir, candidates[0]);
}
const dirConfig = resolveConfigPath(`${__dirname}/..`, 'config');
const dirConfigCommands = resolveConfigPath(`${__dirname}/..`, 'configCommands');

global.GoatBot = {
	config: require(dirConfig),
	configCommands: require(dirConfigCommands)
};
global.utils = require("../utils.js");
global.client = {
	database: {
		creatingThreadData: [],
		creatingUserData: [],
		creatingDashBoardData: []
	}
};
global.db = {
	allThreadData: [],
	allUserData: [],
	globalData: []
};

module.exports = async function () {
	const controller = await require(path.join(__dirname, "..", "database/controller/index.js"))(null); // data is loaded here
	const { threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData } = controller;
	return {
		threadModel,
		userModel,
		dashBoardModel,
		globalModel,
		threadsData,
		usersData,
		dashBoardData,
		globalData
	};
};