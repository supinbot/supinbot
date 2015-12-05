module.exports = CommandManager;

function CommandManager(cmdChar) {
	this.commands = {};
	this.CMDCHAR = cmdChar || '!';
}

CommandManager.prototype.addCommand = function(commandName, func) {
	var command = new Command(commandName, func);
	this.commands[commandName] = command;

	return command;
};

CommandManager.prototype.getCommands = function() {
	return this.commands;
};

CommandManager.prototype.parseMessage = function(message) {
	if (message.slice(0, 1) === this.CMDCHAR) {
		for (var commandName in this.getCommands()) {
			var command = this.getCommands()[commandName];
			if (command.isCommand(message)) {
				return command;
			}
		}
	}
};


function Command (commandName, func) {
	this.name = commandName;
	this.func = func;
	this.admin = false;
	this.owner = false;
	this.channels = [];
	this.arguments = [];
}

Command.prototype.setDescription = function(description) {
	this.description = description;
	return this;
};

Command.prototype.adminOnly = function() {
	this.admin = true;
	return this;
};

Command.prototype.ownerOnly = function() {
	this.owner = true;
	return this;
};

Command.prototype.channelRestriction = function(channels) {
	this.channels = channels;
	return this;
};

Command.prototype.addArgument = function(name, type, def) {
	this.arguments.push({name: name, type: type, default: def});
	return this;
};

Command.prototype.getName = function() {
	return this.name;
};

Command.prototype.isCommand = function(message) {
	var commandLength = this.getName().length;
	if (message.slice(1, commandLength + 1) == this.getName()) {
		var nextChar = message.slice(commandLength + 1, commandLength + 2);
		if (nextChar === ' ' || nextChar === '') {
			return true;
		}
	}

	return false;
};

Command.prototype.canExec = function(user, channel) {
	if (this.admin && !user.is_admin) {
		return 'This command requires admin privileges.';
	} else if (this.owner && !user.is_owner) {
		return 'This command requires owner privileges.';
	} else if (this.channels.length > 0 && this.channels.indexOf(channel.name) < 0) {
		return 'This command cannot be ran in the current channel.';
	}
};

Command.prototype.parseArgs = function(message) {
	var skip = -1;
	var args = [];
	var curString = '';

	for (var i = 0; i < message.length; i++) {
		if (i <= skip) continue;

		var c = message.slice(i, i + 1);

		if (c === '"' || c === '\'') {
			var regex = new RegExp(c + '(.*?)' + c);
			var match = message.slice(i).match(regex);

			if (match) {
				match = match[1];
				curString = '';
				skip = i + match.length + 1;
				args.push(match);
			} else {
				curString = curString + c;
			}
		} else if (c === ' ' && curString !== '') {
			args.push(curString);
			curString = '';
		} else {
			if (c === ' ' && curString === '') continue;
			curString = curString + c;
		}
	}

	if (curString !== '') {
		args.push(curString);
	}

	return args;
};

Command.prototype.verifyArgs = function(args) {
	for (var i = 0; i < this.arguments.length; i++) {
		var argPolicy = this.arguments[i];
		args[i] = args[i] || argPolicy.default;
		var argVal = args[i];

		if (argVal) {
			if (argPolicy.type === 'int' || argPolicy.type === 'float') {
				if (isNaN(Number(argVal))) throw new Error('Argument #' + (i + 1) + '(' + argPolicy.name + ')' + ' needs to be a number :tired_face:');
				if (argPolicy.type === 'int' && argVal % 1 !== 0) throw new Error('Argument #' + (i + 1) + '(' + argPolicy.name + ')' + ' needs to be an integer :confounded:');

				args[i] = Number(argVal);
			}
		} else {
			throw new Error('You did not give me argument #' + (i + 1) + '(' + argPolicy.name + ')' + ', I need it to run this command :anguished:');
		}
	}

	return args;
};

Command.prototype.exec = function(bot, user, channel, message) {
	var permErr = this.canExec(user, channel);
	if (!permErr) {
		var argString = message.slice(this.getName().length + 2);
		var args = this.parseArgs(argString);

		try {
			args = this.verifyArgs(args);
		} catch (e) {
			return bot.postMessage(user.id, e.message, bot.PARAMS);
		}
		this.func(bot, user, channel, args, argString);
	} else {
		bot.postMessage(user.id, permErr, bot.PARAMS);
	}
};
