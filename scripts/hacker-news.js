var request = require('request');
var async = require('async');

var URL = 'https://hacker-news.firebaseio.com/v0/';
var REFRESH_RATE = 120000;
var CHANNEL = '#news';

var lastSeen;

module.exports = function(SupinBot) {
	function callAPI(api, callback) {
		request(URL + api, function(err, res, body) {
			if (err || res.statusCode != 200) {
				SupinBot.log.warn('Failed to get hacker-news data.', {error: err, status: res.statusCode});
				callback();
				return;
			}

			try {
				callback(JSON.parse(body));
			} catch (e) {
				SupinBot.log.warn('Failed to parse hacker-news data.');
				callback();
			}
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
				SupinBot.log.debug('lastSeenIndex', lastSeenIndex);

				if (lastSeenIndex > 0) {
					newStories = newStories.slice(0, lastSeenIndex);

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

				lastSeen = newStories[0];
			}
		});
	}, REFRESH_RATE);
};
