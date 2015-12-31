var convict = require('convict');
var path = require('path');

var config = convict({
	env: {
		doc: 'The application enenvironment',
		format: ['production', 'development'],
		default: 'development',
		env: 'NODE_ENV',
		arg: 'node-env'
	},
	config_file: {
		doc: 'The path to the main configuration file',
		format: String,
		default: 'config/bot-config.json',
		env: 'CONFIG_FILE',
		arg: 'config-file'
	},
	slack: {
		token: {
			doc: 'Slack BOT Integration Token',
			format: String,
			default: null
		},
		name: {
			doc: 'Name of the BOT',
			format: String,
			default: 'SUPINBOT'
		},
		params: {
			doc: 'Default parameters to send along with messages',
			format: Object,
			default: {icon_emoji: ':robot_face:'}
		}
	},
	rollbar_token: {
		doc: 'Rollbar post_server_item token',
		format: String,
		default: null
	},
	log: {
		level: {
			doc: 'The winston logging level',
			format: ['silly', 'debug', 'verbose', 'info', 'warn', 'error'],
			default: 'info',
			env: 'LOG_LEVEL',
			arg: 'log-level'
		},
		filename: {
			doc: 'The name of the winston log file',
			format: String,
			default: 'supinbot.log',
			env: 'LOG_FILE',
			arg: 'log-file'
		}
	},
	scripts: {
		doc: 'Custom scripts to be loaded from node_modules',
		format: Array,
		default: []
	}
});

config.loadConfig = function(configFile, schema) {
	var dir = path.dirname(path.resolve(process.cwd(), config.get('config_file')));
	this.loadFile(path.resolve(dir, configFile));

	try {
		this.validate();
	} catch (e) {
		console.error('An error occured while validating the ' + configFile + ' config file:\n' + e.message);
		process.exit(1);
	}
};

config.loadConfig(path.basename(config.get('config_file')));

module.exports = config;
