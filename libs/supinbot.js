module.exports = Supinbot;

var SlackBot = require('slackbots');
var CommandManager = require('./command-manager');

function Supinbot(config, params) {
	var self = this;
	this.bot = new SlackBot(config);
	this.CommandManager = new CommandManager();

	this.bot.PARAMS = params || {icon_emoji: ':robot_face:'};

	// We add a default help command that lists all commands available to the user running it.
	this.CommandManager.addCommand('help', function(bot, user, channel, args, argsStr) {
		var res = '_Command prefix: *' + self.CommandManager.CMDCHAR + '*_\n';

		for (var commandName in self.CommandManager.getCommands()) {
			var command = self.CommandManager.getCommands()[commandName];
			if (command.canExec(user, channel)) continue;

			res = res + '*' + command.getName() + '* ';

			for (var argID in command.arguments) {
				var argument = command.arguments[argID];
				var argText = argument.type + ':' + argument.name;

				if (typeof argument.default !== 'undefined') {
					res = res + '[' + argText + ' = ' + argument.default + '] ';
				} else {
					res = res + '<' + argText + '> ';
				}
			}

			if (command.description) {
				res = res + ' _' + command.description + '_';
			}

			res = res + '\n';
		}

		res = res.slice(0, -1); // Removes the trailing newline character.

		bot.postMessage(user.id, res, bot.PARAMS);
	})
	.setDescription('You are looking at it...');

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
