module.exports = SupinBot = {};

var EventEmitter = require('events').EventEmitter;
var path = require('path');
var fs = require('fs');

var extend = require('extend');
var winston = require('winston');
var SlackBot = require('slackbots');
var CommandManager = require(path.resolve('libs/command-manager'));
var config = require(path.resolve('libs/config'));


SupinBot.config = config;
SupinBot.bot = new SlackBot(config.get('slack'));
SupinBot.CommandManager = new CommandManager();
SupinBot.events = new EventEmitter();
SupinBot.log = new winston.Logger({
	level: config.get('log.level'),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: config.get('log.filename'),
			handleExceptions: true
		})
	]
});

SupinBot.PARAMS = config.get('slack.params');


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


SupinBot.postMessage = function(channel, message, params) {
	return SupinBot.bot.postMessage(channel, message, extend(SupinBot.PARAMS, params));
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

SupinBot.loadScripts = function() {
	fs.readdirSync(path.resolve('scripts')).sort().forEach(function(file) {
		SupinBot.loadScript(path.resolve('scripts', file));
	});

	config.get('scripts').forEach(function(script) {
		SupinBot.loadScript(script);
	});
};

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
};

SupinBot.loadScripts();
