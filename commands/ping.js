module.exports = function(SupinBot) {

	SupinBot.CommandManager.addCommand('add', function(user, channel, args, argsStr) {
		SupinBot.postMessage(channel.id, 'PONG!');
	})
	.setDescription('Posts "PONG!" in the current channel.');

};