'use strict';
let cluster = require('cluster');
const worker = process.env.WEB_CONCURRENCY || 1;

if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);
	// Fork workers.
	for (var i = 0; i < worker; i++) {
		cluster.fork({RUN_CRON : i === 0 });
	}

	Object.keys(cluster.workers).forEach(function (id) {
		console.log("I am running with ID : " + cluster.workers[id].process.pid);
		console.log("I am running with ID : " + cluster.workers[id].process.pid);
	});

	cluster.on('exit', function (worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		if (signal) {
			console.log(`worker was killed by signal: ${signal}`);
		} else if (code !== 0) {
			console.log(`worker exited with error code: ${code}`);
		} else {
			console.log('worker success!');
		}
		cluster.fork();
	});
} else {
	global.NODE_ENV = process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
	const express = require('express');
	const config = require('./init/config').init();
	global.config = config;

	let app = express();
	let server = require('http').createServer(app);
	let io = require('socket.io')(server, {
		'transports': ['websocket', 'polling'],
		pingInterval: 15000,
		pingTimeout: 30000
	});
	//let io = require('socket.io')(server, {
	//	'transports': ['websocket', 'polling'],
	//	pingInterval: 15000,
	//	pingTimeout: 30000
	//});
	let redis = require('socket.io-redis');
	let pg = require('./db/initPg');
	let phantomInit = require('./init/phantomInit');
	io.adapter(redis(process.env.REDIS_URL));
	process.env.TZ = 'Europe/Bucharest';

	Promise.all([pg(config), phantomInit.createPhantomSession(app)]).then(values => {
		app.locals.config = config;
		app.locals.db = values[0];
		app.locals.ph = values[1];
		app.io = io;

		require('./init/express')(app, config);
		require('./routes')(app);

		io.on('connection', socket => {
			socket.on('join', data => {
				socket.join(data.id);
				//console.log('io.sockets rooms', io.sockets.adapter.rooms);
			});
		});
		io.of('/').adapter.on('error', err => console.log('ERROR no redis server', err));

		const port = process.env.PORT || 2000;
		server.listen(port, config.ip, () => {
			console.log('Listening on port: %d, env: %s', port, config.env);
			process.on('exit', () => {
				console.log('exiting phantom session');
				app.locals.ph.exit();
			});
		});
	}).catch(e => console.log('Init sequence error: ', e));

	module.exports = app;
}