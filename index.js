var Supinbot = require('./libs/supinbot');
var querystring = require('querystring');
var fs = require('fs');

var BOT_CONFIG = JSON.parse(fs.readFileSync('./bot-config.json'));
var PARAMS = {icon_emoji: ':robot_face:'};

var SupinBot = new Supinbot(BOT_CONFIG, PARAMS);

SupinBot.CommandManager.addCommand('add', function(bot, user, channel, args, argsStr) {
	bot.postMessage(channel.id, args[0] + ' + ' + args[1] + ' = ' + String(args[0] + args[1]), PARAMS);
})
.setDescription('Adds two numbers.')
.channelRestriction(['global', 'dev'])
.addArgument('Number #1', 'int', 5)
.addArgument('Number #2', 'int', 2);

SupinBot.CommandManager.addCommand('time', function(bot, user, channel, args, argsStr) {
	bot.postMessage(channel.id, String(new Date()), PARAMS);
})
.setDescription('Displays the current time.');

SupinBot.CommandManager.addCommand('google', function(bot, user, channel, args, argsStr) {
	var url = 'http://lmgtfy.com/?' + querystring.stringify({q: argsStr});
	bot.postMessage(channel.id, url + ' :expressionless:', PARAMS);
})
.setDescription('Generates a \'Let Me Google That For You\' link.')
.addArgument('Search Query', 'string');
