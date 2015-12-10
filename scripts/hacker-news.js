var request = require('request');
var async = require('async');

var URL = 'https://hacker-news.firebaseio.com/v0/';
var REFRESH_RATE = 120000;
var CHANNEL = '#news';

var lastSeen = undefined;

module.exports = function(SupinBot) {
	SupinBot.log.info('Loading Hacker News...');

	function callAPI(api, callback) {
		request(URL + api, function(err, res, body) {
			if (err || res.statusCode != 200) {
				SupinBot.log.warn('Failed to get hacker-news data.', {error: err, status: res.statusCode});
				callback();
			}

			try {
				var data = JSON.parse(body);
			} catch (e) {
				SupinBot.log.warn('Failed to parse hacker-news data.');
				callback();
			}

			callback(data);
		});
	}

	function getLastSeen() {
		callAPI('newstories.json', function(newStories) {
			if (newStories) {
				lastSeen = newStories[0];
			} else {
				setTimeout(function() {
					getLastSeen();
				}, 10000);
			}
		});
	}

	getLastSeen();

	setInterval(function() {
		if (!lastSeen) return;

		SupinBot.log.debug('Looking for new Hacker News stories...');

		callAPI('newstories.json', function(newStories) {
			if (newStories) {
				var lastSeenIndex = newStories.indexOf(lastSeen);
				if (lastSeenIndex > 0) {
					var newStories = newStories.slice(0, lastSeenIndex);
					lastSeen = newStories[0];

					async.each(newStories, function(storyID, next) {
						callAPI('item/' + storyID + '.json', function(story) {
							if (story && story.title && story.url) {
								SupinBot.log.debug('Posting Hacker News story...', story);
								SupinBot.postMessage(CHANNEL, '*' + story.title + '*\n' + story.url);
							}
							next();
						});
					});
				}
			}
		});
	}, REFRESH_RATE);
};
