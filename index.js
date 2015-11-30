var SlackBot = require("slackbots")
var fs = require("fs")

var BOT_CONFIG = JSON.parse(fs.readFileSync("./bot-config.json"))
var COMMANDS = {}
var CHANNELS = {}
var USERS = {}
var PARAMS = {icon_emoji: ":robot_face:"}

var supinbot = new SlackBot({
	token: BOT_CONFIG["token"],
	name: BOT_CONFIG["name"]
})

/* Functions */
function getChannelByID (channelID) {
	var returnVal = {}

	CHANNELS.forEach(function (channel) {
		if (channel.id == channelID) {
			returnVal = channel
		}
	})

	return returnVal
}

function getUserByID (userID) {
	var returnVal = {}

	USERS.forEach(function (user) {
		if (user.id == userID) {
			returnVal = user
		}
	})

	return returnVal
}

function updateChannels() {
	supinbot.getChannels().then(function (data) {
		CHANNELS = data.channels
	})
}

function updateUsers() {
	supinbot.getUsers().then(function (data) {
		USERS = data.members
	})
}

function addCommand (command, admin, func) {
	COMMANDS[command] = {
		admin: admin,
		func: func
	}
}

/* Events */
supinbot.on("message", function (data) {
	if (data.type == "message") {
		if (data.subtype != "bot_message" && data.text) {
			var channel = getChannelByID(data.channel)
			var user = getUserByID(data.user)

			for (var command in COMMANDS) {
				if (data.text.toLowerCase().startsWith(command.toLowerCase())) {
					var commandData = COMMANDS[command]

					if (!commandData.admin || user.is_admin) {
						console.log(user.name + " ran the " + command + " command.")

						commandData.func(user, channel)
						return
					} else {
						supinbot.postMessage(data.user, "You do not have access to this command!", PARAMS)
					}
				}
			}
		}
	} else if (data.type == "user_change" || data.type == "team_join") {
		console.log("Updating users...")
		updateUsers()
	}
})

supinbot.on("start", function() {
	supinbot.postMessageToChannel("global", "Hai! My name is " + BOT_CONFIG["name"] + ", at your service! :computer:", PARAMS)

	updateChannels()
	updateUsers()
})

/* Commands */
addCommand("!popopo", false, function (user, channel) {
	supinbot.postMessage(channel.id, "http://m.memegen.com/4m5i4s.jpg", PARAMS)
})

addCommand("!valentin", true, function (user, channel) {
	supinbot.postMessage(channel.id, "http://i.imgur.com/ODOZLmy.png", PARAMS)
})