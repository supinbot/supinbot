module.exports = Supinbot;

var SlackBot = require('slackbots');
var CommandManager = require('./command-manager');

function Supinbot(config, params) {
	var self = this;
	this.bot = new SlackBot(config);
	this.CommandManager = new CommandManager();

	this.bot.PARAMS = params || {icon_emoji: ':robot_face:'};

	this.bot.on('message', function (data) {
		if (data.type == 'message') {
			if (data.subtype != 'bot_message' && data.text) {
				var channel = self.getChannelByID(data.channel);
				var user = self.getUserByID(data.user);
				var command = self.CommandManager.parseMessage(data.text);

				if (command) {
					command.exec(this, user, channel, data.text);
				}
			}
		}
	});

	this.bot.on('open', function() {
		this.postMessage('dev', 'Hai! My name is ' + this.name + ', at your service! :computer:', this.PARAMS);
	});
}

Supinbot.prototype.getChannelByID = function(channelID) {
	for (var channel in this.bot.channels) {
		if (this.bot.channels[channel].id == channelID) {
			return this.bot.channels[channel];
		}
	}

	for (var group in this.bot.groups) {
		if (this.bot.groups[group].id == channelID) {
			return this.bot.groups[group];
		}
	}
};

Supinbot.prototype.getUserByID = function(userID) {
	for (var user in this.bot.users) {
		if (this.bot.users[user].id == userID) {
			return this.bot.users[user];
		}
	}
};
