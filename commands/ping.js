'use strict';

module.exports = function(SupinBot) {

	SupinBot.CommandManager.addCommand('ping', function(user, channel, args, argsStr) {
		SupinBot.postMessage(channel.id, 'PONG!');
	})
	.setDescription('Posts "PONG!" in the current channel.');

};
