var querystring = require('querystring');

module.exports = function(SupinBot) {

	SupinBot.CommandManager.addCommand('google', function(user, channel, args, argsStr) {
		var url = 'http://lmgtfy.com/?' + querystring.stringify({q: argsStr});
		SupinBot.postMessage(channel.id, url + ' :expressionless:');
	})
	.setDescription('Generates a \'Let Me Google That For You\' link.')
	.addArgument('Search Query', 'string');

};
