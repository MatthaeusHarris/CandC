var events = require('events');
var util = require('util');
var moment = require('moment');
var net = require('net');

var CandC = function(context, options) {
	if (this instanceof CandC === false) {
		return new CandC();
	}

	util.log("CandC instantiated.");

	if (typeof options === 'object') {
		util.log("options found.");
		this.port = options.port || process.env.CANDC_PORT || 8001;
		this.host = options.host || process.env.CANDC_HOST || 'localhost';
	} else {
		this.port = process.env.CANDC_PORT || 8001;
		this.host = process.env.CANDC_HOST || 'localhost';
	}

	this.commands = {};
	this.descriptions = {};
	this.context = context;
	this.server = null;

	events.EventEmitter.call(this);
}

util.inherits(CandC, events.EventEmitter)

CandC.prototype = {
	command: function(command, handler, description) {
		if (command == "help") {
			throw new error("help is a reserved command.");
		}
		this.commands[command] = handler;
		this.descriptions[command] = description || "No description provided.";
	},

	start: function() {
		util.log("CandC server started.");
		this.server = net.createServer(this.connectionHandler.bind(this));
		this.server.listen(this.port, this.host, function() {
			util.log("CandC server listening on " + this.host + ":" + this.port);
		}.bind(this));
	},

	connectionHandler: function(sock) {
		sock.setEncoding('ascii');
		sock.on('data', this.returnDataHandler(this));
		sock.write('> ');
	},

	returnDataHandler: function(self) {
		return function(data) {
			var sock = this;
			var parsedCommand = data.trim().split(' ');
			var cmd = parsedCommand.splice(0,1);
			var ret;
			if (cmd == 'help') {
				for (var c in self.commands) {
					sock.write("\t" + c + ":\t" + self.descriptions[c])
				}
			} else {
				if (typeof self.commands[cmd] === 'function') {
					ret = self.commands[cmd](parsedCommand, self.context);
					if (typeof ret === 'string') {
						sock.write(ret);
					}
				}
			}
			sock.write('\n> ');
		}
	}
}

module.exports = CandC;