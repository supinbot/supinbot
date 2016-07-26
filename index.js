'use strict';

var SupinBot = {};
module.exports = SupinBot;


/*----------  Init  ----------*/
const fs = require('fs');

require('dotenv').config({path: 'shared/.env'});

const extend = require('extend');
const winston = require('winston');
const SlackClient = require('@slack/client');
const pkg = require('./package.json');
const CommandManager = require('./lib/command-manager');
const config = require('./lib/config');


SupinBot.config = config;
SupinBot.CommandManager = new CommandManager();
SupinBot.log = new winston.Logger({
	level: config.get('log_level'),
	transports: [
		new winston.transports.Console({
			json: false,
			handleExceptions: true,
			humanReadableUnhandledException: true
		}),
		new winston.transports.File({
			filename: './shared/supinbot.log',
			json: false,
			handleExceptions: true,
			humanReadableUnhandledException: true
		})
	]
});

SupinBot.log.winstonInfoStream = {
	write: (msg, encoding) => {
		SupinBot.log.info(msg.trim());
	}
};

// We require express here because express requires winston.
var WebApp = require('./app');
SupinBot.WebApp = WebApp;
/*----------------------------*/


/*----------  SlackClient  ----------*/
SupinBot.DataStore = new SlackClient.MemoryDataStore();
SlackClient.MemoryDataStore.prototype.getChannelOrGroupById = function(objectId) {
	var channel = this.getChannelById(objectId);
	if (channel) return channel;

	return this.getGroupById(objectId);
};

var clientConfig = {
	dataStore: SupinBot.DataStore,
	logLevel: config.get('log_level'),
	logger: function (logLevel, logString) {
		SupinBot.log.log(logLevel, logString);
	}
};

SupinBot.RtmClient = new SlackClient.RtmClient(config.get('slack.token'), clientConfig);
SupinBot.WebClient = new SlackClient.WebClient(config.get('slack.token'), clientConfig);
SupinBot.RTM_EVENTS = SlackClient.RTM_EVENTS;
SupinBot.CLIENT_EVENTS = SlackClient.CLIENT_EVENTS;
SupinBot.RTM_MESSAGE_SUBTYPES = SlackClient.RTM_MESSAGE_SUBTYPES;
SupinBot.PARAMS = extend({username: config.get('slack.name')}, config.get('slack.params'));


SupinBot.RtmClient.on(SupinBot.RTM_EVENTS.MESSAGE, function (data) {
	if (data.text) {
		var channel = SupinBot.DataStore.getChannelOrGroupById(data.channel);
		var user = SupinBot.DataStore.getUserById(data.user);
		var command = SupinBot.CommandManager.parseMessage(data.text);

		if (command) {
			command.exec(SupinBot, user, channel, data.text);
		}
	}
});

SupinBot.RtmClient.on(SupinBot.CLIENT_EVENTS.RTM.DISCONNECT, function() {
	process.exit(1);
});
/*-----------------------------------*/



/*----------  Utility  ----------*/
/**
 * Shortcut function to post a message.
 * @param {String} channel The channel to post the message in.
 * @param {String} message The message to post.
 * @param {Object} [params] Additional message parameters (attachments for example).
 */
SupinBot.postMessage = function(channel, message, params) {
	return SupinBot.WebClient.chat.postMessage(channel, message, extend({}, SupinBot.PARAMS, params));
};

/**
 * Loads all files in the commands folder.
 */
SupinBot.loadCommands = function() {
	fs.readdirSync('commands').sort().forEach(function(file) {
		SupinBot.loadModule('./commands/' + file);
	});
};

/**
 * Loads all files in the commands folder.
 */
SupinBot.loadPlugins = function() {
	config.get('plugins').forEach(function(plugin) {
		SupinBot.loadModule('./shared/plugins/node_modules/' + plugin);
	});
};

/**
 * Loads a module.
 * @param {String} filePath The main script of the module. (index.js)
 */
SupinBot.loadModule = function(filePath) {
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
/*-------------------------------*/


/*----------  Start  ----------*/
SupinBot.log.info('Loading SUPINBOT v' + pkg.version);
SupinBot.log.info('Loading commands...');
SupinBot.loadCommands();
SupinBot.log.info('Commands loaded!');

SupinBot.log.info('Loading plugins...');
SupinBot.loadPlugins();
SupinBot.log.info('Plugins loaded!');

SupinBot.RtmClient.start();

SupinBot.log.info('Starting the WebApp...');
SupinBot.WebApp.startWebApp();
SupinBot.log.info('WebApp started!');

process.on('SIGTERM', () => {
	SupinBot.log.info('Shutting down...');

	SupinBot.RtmClient.disconnect();
	SupinBot.WebApp.httpServer.close(() => {
		process.emit('SHUTDOWN'); // Let plugins know that it is now safe to disconnect from redis and mongodb.
	});
});
/*---------------------------*/
