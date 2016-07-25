'use strict';

/**
 * Called when a command is executed.
 *
 * @callback commandCallback
 * @param {Object} user The user who entered the command.
 * @param {Object} channel The channel in which the command was entered.
 * @param {Array} args Command parameters parsed as an array.
 * @param {String} argsStr Raw command parameters.
 */

module.exports = class CommandManager {
	/**
	 * Object that stores all Command objects.
	 * @param {String} [commandChar=!] The character to use to identify commands in chat.
	 * @constructor
	 */
	constructor(commandChar) {
		if (commandChar && commandChar.length > 1) {
			throw new Error('commandChar cannot be more than a character long!');
		}

		this.commands = {};
		this.COMMAND_CHAR = commandChar || '!';
	}

	/**
	 * Creates a new command.
	 * @param {String} commandName The name of the command.
	 * @param {commandCallback} func Function called when the command is executed.
	 * @returns {Command}
	 */
	addCommand(commandName, func) {
		var command = new Command(commandName, func);
		this.commands[commandName] = command;

		return command;
	}

	/**
	 * Returns an object containing all commands.
	 * @returns {Object}
	 */
	getCommands() {
		return this.commands;
	}

	/**
	 * Returns the first command found in the message.
	 * @param {String} message Message entered by a user.
	 * @returns {Command}
	 */
	parseMessage(message) {
		if (message.slice(0, 1) === this.COMMAND_CHAR) {
			for (var commandName in this.getCommands()) {
				var command = this.getCommands()[commandName];
				if (command.isCommand(message)) {
					return command;
				}
			}
		}
	}
};


class Command {
	/**
	 * Command that can be executed by a user.
	 * @param {String} commandName The name of the command.
	 * @param {commandCallback} func Function called when the command is executed.
	 * @constructor
	 */
	constructor(commandName, func) {
		this.name = commandName;
		this.func = func;
		this.admin = false;
		this.owner = false;
		this.channels = [];
		this.arguments = [];
	}

	/**
	 * Sets the description of the command (used in the help command).
	 * @param {String} description Description of the command.
	 * @returns {Command}
	 */
	setDescription(description) {
		this.description = description;
		return this;
	}

	/**
	 * Prevents the command from being executed by non admins.
	 * @returns {Command}
	 */
	adminOnly() {
		this.admin = true;
		return this;
	}

	/**
	 * Prevents the command from being executed by non owners.
	 * @returns {Command}
	 */
	ownerOnly() {
		this.owner = true;
		return this;
	}

	/**
	 * Prevents the command from being executed in certain channels.
	 * @param {Array} channels Authorized channels.
	 * @returns {Command}
	 */
	channelRestriction(channels) {
		this.channels = channels;
		return this;
	}

	/**
	 * Define an argument for the command.
	 * @param {String} channels Authorized channels.
	 * @param {String} type The type the argument is expecting (int, float, str).
	 * @param {(String|Number)} [def] Default value, makes the argument optional.
	 * @returns {Command}
	 */
	addArgument(name, type, def) {
		this.arguments.push({name: name, type: type, default: def});
		return this;
	}

	/**
	 * Returns the command name.
	 * @returns {String}
	 */
	getName() {
		return this.name;
	}

	/**
	 * Returns wether or not a message is corresponding to this command.
	 * @param {String} message Message entered by a user.
	 * @returns {Bool}
	 */
	isCommand(message) {
		var commandLength = this.getName().length;
		if (message.slice(1, commandLength + 1) == this.getName()) {
			var nextChar = message.slice(commandLength + 1, commandLength + 2);
			if (nextChar === ' ' || nextChar === '') {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns an error if the user is not allowed to execute the command.
	 * @param {Object} user User object.
	 * @param {Object} channel Channel object.
	 * @returns {(String|null)}
	 */
	canExec(user, channel) {
		if (this.admin && !user.is_admin) {
			return 'This command requires admin privileges.';
		} else if (this.owner && !user.is_owner) {
			return 'This command requires owner privileges.';
		} else if (this.channels.length > 0 && this.channels.indexOf(channel.name) < 0) {
			return 'This command cannot be ran in the current channel.';
		}
	}

	/**
	 * Parse a message into an array of strings.
	 * @param {String} message Message entered by a user.
	 * @returns {Array}
	 */
	parseArgs(message) {
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
	}

	/**
	 * Converts the command arguments to their desired types and handles input errors.
	 * @param {Array} args Parsed arguments.
	 * @returns {Array}
	 */
	verifyArgs(args) {
		for (var i = 0; i < this.arguments.length; i++) {
			var argPolicy = this.arguments[i];
			args[i] = args[i] || argPolicy.default;
			var argVal = args[i];

			if (argVal) {
				if (argPolicy.type === 'int' || argPolicy.type === 'float') {
					if (isNaN(Number(argVal))) throw new Error(`Argument #${i + 1}(${argPolicy.name}) needs to be a number :tired_face:`);
					if (argPolicy.type === 'int' && argVal % 1 !== 0) throw new Error(`Argument #${i + 1}(${argPolicy.name}) needs to be an integer :confounded:`);

					args[i] = Number(argVal);
				} else if (argPolicy.type === 'bool') {
					argVal = argVal.lower().trim();
					if (argVal !== 'true' && argVal !== 'false') throw new Error(`Argument #${i + 1}(${argPolicy.name}) needs to be a boolean :fearful:`);
					args[i] = argVal === 'true';
				}
			} else {
				throw new Error(`You did not give me argument #${i + 1}(${argPolicy.name}), I need it to run this command :anguished:`);
			}
		}

		return args;
	}

	/**
	 * Executes a command as a user in a channel.
	 * @param {SupinBot} bot SupinBot object.
	 * @param {Object} user User object.
	 * @param {Object} channel Channel object.
	 * @param {String} message Message entered by the user.
	 */
	exec(bot, user, channel, message) {
		var permErr = this.canExec(user, channel);
		if (!permErr) {
			var argString = message.slice(this.getName().length + 2);
			var args = this.parseArgs(argString);

			try {
				args = this.verifyArgs(args);
			} catch (e) {
				return bot.postMessage(user.id, e.message);
			}
			this.func(user, channel, args, argString);
		} else {
			bot.postMessage(user.id, permErr);
		}
	}
}
