'use strict';

const convict = require('convict');

var config = convict({
	env: {
		doc: 'The application enenvironment',
		format: ['production', 'development'],
		default: 'development',
		env: 'NODE_ENV'
	},
	slack: {
		token: {
			doc: 'Slack BOT Integration Token',
			format: String,
			default: null,
			env: 'SUPINBOT_SLACK_TOKEN'
		},
		name: {
			doc: 'Name of the BOT',
			format: String,
			default: 'SUPINBOT',
			env: 'SUPINBOT_SLACK_NAME'
		},
		params: {
			doc: 'Default parameters to send along with messages',
			format: Object,
			default: '{"icon_emoji": ":robot_face:"}',
			env: 'SUPINBOT_SLACK_PARAMS'
		}
	},
	log_level: {
		doc: 'The winston logging level',
		format: ['silly', 'debug', 'verbose', 'info', 'warn', 'error'],
		default: 'info',
		env: 'SUPINBOT_LOG_LEVEL'
	},
	redis: {
		doc: 'The Redis connection URI',
		format: String,
		default: 'redis://redis:6379',
		env: 'SUPINBOT_REDIS_URI'
	},
	web: {
		url: {
			doc: 'The URL to the web interface (with trailing /)',
			format: String,
			default: 'http://localhost:8080/',
			env: 'SUPINBOT_WEB_URL'
		},
		trust_proxy: {
			doc: 'See: https://expressjs.com/en/guide/behind-proxies.html',
			format: Object,
			default: '"loopback"',
			env: 'SUPINBOT_WEB_TRUST_PROXY'
		},
		port: {
			doc: 'The port the web server will listen on',
			format: 'nat',
			default: 8080,
			env: 'SUPINBOT_WEB_PORT'
		},
		no_cache: {
			doc: 'Disable the caching of templates',
			format: Boolean,
			default: false,
			env: 'SUPINBOT_WEB_DISABLE_CACHE'
		}
	},
	plugins: {
		doc: 'A JSON Array of enabled plugin names',
		format: Object,
		default: [],
		env: 'SUPINBOT_PLUGINS'
	}
});

config.loadConfig = function(schema) {
	var conf;

	if (schema) {
		conf = convict(schema);
	} else {
		conf = this;
	}

	try {
		conf.validate();
	} catch (e) {
		console.error('An error occured while validating the configuration:\n' + e.message);
		process.exit(1);
	}

	return conf;
};

module.exports = config;
