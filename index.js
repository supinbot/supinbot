module.exports = SupinBot = {};


/*----------  Init  ----------*/
var EventEmitter = require('events').EventEmitter;
var path = require('path');
var fs = require('fs');

require('dotenv').config({path: 'shared/.env'});

var extend = require('extend');
var winston = require('winston');
var SlackClient = require('@slack/client');
var pkg = require('./package.json');
var CommandManager = require('./libs/command-manager');
var config = require('./libs/config');


SupinBot.config = config;
SupinBot.CommandManager = new CommandManager();
SupinBot.events = new EventEmitter();
SupinBot.log = new winston.Logger({
	level: config.get('log.level'),
	transports: [
		new winston.transports.Console({
			json: false,
			handleExceptions: true
		}),
		new winston.transports.File({
			filename: './shared/supinbot.log',
			json: false,
			handleExceptions: true
		})
	]
});
/*----------------------------*/


/*----------  SlackClient  ----------*/
SupinBot.DataStore = new SlackClient.MemoryDataStore();
SlackClient.MemoryDataStore.prototype.getChannelOrGroupById = function(objectId) {
	var channel = this.getChannelById(objectId);
	if (channel) {
		return channel;
	}

	return this.getGroupById(objectId);
};

var clientConfig = {
	dataStore: SupinBot.DataStore,
	logLevel: config.get('log.level'),
	logger: function (logLevel, logString) {
		SupinBot.log.log(logLevel, logString);
	}
};

SupinBot.RtmClient = new SlackClient.RtmClient(config.get('slack.token'), clientConfig);
SupinBot.WebClient = new SlackClient.WebClient(config.get('slack.token'), clientConfig);
SupinBot.RTM_EVENTS = SlackClient.RTM_EVENTS;
SupinBot.RTM_MESSAGE_SUBTYPES = SlackClient.RTM_MESSAGE_SUBTYPES;
SupinBot.PARAMS = extend({username: config.get('slack.name')}, config.get('slack.params'));


SupinBot.RtmClient.on(SupinBot.RTM_EVENTS.MESSAGE, function (data) {
	if (data.text) {
		var channel = SupinBot.DataStore.getChannelOrGroupById(data.channel);
		var user = SupinBot.DataStore.getUserById(data.user);
		var command = SupinBot.CommandManager.parseMessage(data.text);

		if (command) {
			command.exec(this, user, channel, data.text);
		}
	}

	process.nextTick(function() {
		SupinBot.events.emit('message', data);
	});
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
/*----------------- ----------*/
