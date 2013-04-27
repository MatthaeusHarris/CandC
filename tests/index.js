var CandC = require('../lib/index');

var context = {
	hosts: {
		"localhost": {
			"foo":"bar"
		}
	}, 
	connections: {}
};

var CandCServer = new CandC(context, {port: 8001});

CandCServer.command('context', function(args, context) {
	console.log(args);
	console.log(context);
	return JSON.stringify(context, null, 2);
}, "Show the provided context.");

CandCServer.start();