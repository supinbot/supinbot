var Supinbot = require('./libs/supinbot');
var fs = require('fs');

var BOT_CONFIG = JSON.parse(fs.readFileSync('./bot-config.json'));
var PARAMS = {icon_emoji: ':robot_face:'};

var SupinBot = new Supinbot(BOT_CONFIG, PARAMS);

SupinBot.CommandManager.addCommand('add', function(bot, user, channel, args, argsStr) {
	bot.postMessage(channel.id, args[0] + ' + ' + args[1] + ' = ' + String(args[0] + args[1]), PARAMS);
})
.channelRestriction(['global', 'dev'])
.addArgument({type: 'int'})
.addArgument({type: 'int'});

SupinBot.CommandManager.addCommand('time', function(bot, user, channel, args, argsStr) {
	bot.postMessage(channel.id, String(new Date()), PARAMS);
});
