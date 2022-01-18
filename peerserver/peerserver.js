let { PeerServer } = require('peer');
let fs = require('fs');

let peerServer = PeerServer({
	port: 8001,
	ssl: {
		key: fs.readFileSync('../localhost+2-key.pem'),
		cert: fs.readFileSync('../localhost+2.pem'),
	},
});

peerServer.on('connection', (client) => {
	console.log('client connected');
});

peerServer.on('disconnect', (client) => {
	console.log('client disconnected');
});
