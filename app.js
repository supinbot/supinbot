'use strict';

const path = require('path');
const express = require('express');
const nunjucks = require('nunjucks');
const config = require('./lib/config');
var SupinBot = require('./index');

const PLUGIN_VIEW_PATH_PREFIX = 'shared/plugins/node_modules/';
const PLUGIN_VIEW_PATH_SUFFIX = 'views/';

var app = express();
app.set('trust proxy', config.get('web.trust_proxy'));

var viewPaths = ['views'];

/**
 * Registers a new route for a plugin.
 * @param {String} pluginName The name of the folder containing the plugin.
 * @param {String} route The URL of the route (/myRoute).
 * @param {String} displayName The name of the route (used in SupinBot pages).
 * @param {Object} router The express router to use.
 */
app.registerRoute = function(pluginName, route, displayName, router) {
	app.use(route, router);
	viewPaths.push(path.join(__dirname, PLUGIN_VIEW_PATH_PREFIX, pluginName, PLUGIN_VIEW_PATH_SUFFIX));
};

/**
 * Configures the express server and starts it.
 */
app.startWebApp = function() {
	nunjucks.configure(viewPaths, {
		autoescape: true,
		noCache: config.get('web.no_cache'),
		express: app,
	});

	app.use(function(err, req, res, next) {
		SupinBot.log.error(err);
		res.sendStatus(err.status || 500);
	});

	app.listen(config.get('web.port'));
};

module.exports = app;
