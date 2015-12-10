module.exports = SupinBot = {};

var EventEmitter = require('events').EventEmitter;
var path = require('path');
var fs = require('fs');

var extend = require('extend');
var winston = require('winston');
var SlackBot = require('slackbots');
var CommandManager = require(path.resolve('.', 'libs', 'command-manager'));


try {
	var BOT_CONFIG = JSON.parse(fs.readFileSync(path.resolve('.', 'bot-config.json')))
} catch (e) {
	winston.error('Failed to load bot-config.json, aborting!');
	process.exit(1);
}


SupinBot.bot = new SlackBot(BOT_CONFIG.slackbot);
SupinBot.CommandManager = new CommandManager();
SupinBot.events = new EventEmitter();
SupinBot.log = new winston.Logger({
	level: (BOT_CONFIG.log.debug) ? 'debug' : 'info',
	transports: [
		new winston.transports.Console,
		new winston.transports.File({
			filename: (BOT_CONFIG.log.filename) ? BOT_CONFIG.log.filename : 'supinbot.log',
			handleExceptions: true
		})
	]
});

SupinBot.PARAMS = BOT_CONFIG.params || {icon_emoji: ':robot_face:'};


SupinBot.bot.on('message', function (data) {
	SupinBot.log.debug('WS Event', data);

	if (data.type == 'message') {
		if (data.subtype != 'bot_message' && data.text) {
			var channel = SupinBot.getChannelByID(data.channel);
			var user = SupinBot.getUserByID(data.user);
			var command = SupinBot.CommandManager.parseMessage(data.text);

			if (command) {
				command.exec(this, user, channel, data.text);
			}
		}
	}

	process.nextTick(function() {
		SupinBot.events.emit('message', data);
	});
});


SupinBot.loadScripts = function() {
	fs.readdirSync(path.resolve('.', 'scripts')).sort().forEach(function(file) {
		SupinBot.loadScript(path.resolve('.', 'scripts', file));
	});

	if (BOT_CONFIG.scripts) {
		BOT_CONFIG.scripts.forEach(function(script) {
			SupinBot.loadScript(path.resolve('.', 'node_modules', script));
		})
	}
}

SupinBot.loadScript = function(filePath) {
	try {
		var script = require(filePath);

		if (typeof script === 'function') {
			return script(SupinBot);
		}

		SupinBot.log.error('Cannot load ' + filePath + ', module.exports is not a function.');
	} catch (e) {
		SupinBot.log.error('An uncaught error occured while loading ' + filePath);
		SupinBot.log.error(e);
	}
}
SupinBot.loadScripts()

SupinBot.postMessage = function(channel, message, params) {
	return SupinBot.bot.postMessage(channel, message, extend(SupinBot.PARAMS, params))
};

SupinBot.getChannelByID = function(channelID) {
	for (var channel in SupinBot.bot.channels) {
		if (SupinBot.bot.channels[channel].id == channelID) {
			return SupinBot.bot.channels[channel];
		}
	}

	for (var group in SupinBot.bot.groups) {
		if (SupinBot.bot.groups[group].id == channelID) {
			return SupinBot.bot.groups[group];
		}
	}
};

SupinBot.getUserByID = function(userID) {
	for (var user in SupinBot.bot.users) {
		if (SupinBot.bot.users[user].id == userID) {
			return SupinBot.bot.users[user];
		}
	}
};
