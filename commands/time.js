module.exports = function(SupinBot) {

	SupinBot.CommandManager.addCommand('time', function(user, channel, args, argsStr) {
		SupinBot.postMessage(channel.id, String(new Date()));
	})
	.setDescription('Displays the current time.');

};
