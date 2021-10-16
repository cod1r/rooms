import { Server } from 'socket.io';

const io = new Server();

io.on('connection', (socket) => {
	console.log('hi');
	socket.on('audio', (audio) => {
		console.log('audio');
	});
});

io.listen(3001);