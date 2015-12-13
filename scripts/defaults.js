var querystring = require('querystring');

module.exports = function(SupinBot) {

	// We add a default help command that lists all commands available to the user running it.
	SupinBot.CommandManager.addCommand('help', function(user, channel, args, argsStr) {
		var res = '_Command prefix: *' + SupinBot.CommandManager.CMDCHAR + '*_\n';

		for (var commandName in SupinBot.CommandManager.getCommands()) {
			var command = SupinBot.CommandManager.getCommands()[commandName];
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

		SupinBot.postMessage(user.id, res);
	})
	.setDescription('You are looking at it...');


	SupinBot.CommandManager.addCommand('add', function(user, channel, args, argsStr) {
		SupinBot.postMessage(channel.id, args[0] + ' + ' + args[1] + ' = ' + String(args[0] + args[1]));
	})
	.setDescription('Adds two numbers.')
	.channelRestriction(['global', 'dev'])
	.addArgument('Number #1', 'int', 5)
	.addArgument('Number #2', 'int', 2);


	SupinBot.CommandManager.addCommand('time', function(user, channel, args, argsStr) {
		SupinBot.postMessage(channel.id, String(new Date()));
	})
	.setDescription('Displays the current time.');


	SupinBot.CommandManager.addCommand('google', function(user, channel, args, argsStr) {
		var url = 'http://lmgtfy.com/?' + querystring.stringify({q: argsStr});
		SupinBot.postMessage(channel.id, url + ' :expressionless:');
	})
	.setDescription('Generates a \'Let Me Google That For You\' link.')
	.addArgument('Search Query', 'string');
};
