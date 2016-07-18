'use strict';

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

};
