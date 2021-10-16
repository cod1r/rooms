import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
export default function Room() {
	const [peer, setPeer] = useState(null);
	useEffect(() => {
		(async () => {
			let Peer = (await import('peerjs')).default;
			setPeer(new Peer());
		})();
	}, []);
	let handleCall = () => {
		navigator.mediaDevices.getUserMedia({audio:true}).then((stream) => {
			let call = peer.call('234982304982342342342342423424', stream);
			call.on('stream', (remoteStream) => {
			});
		}).catch(err => console.error(err));
		peer.on('call', (call) => {
			console.log('hi');
		});
		peer.on('error', (err) => {
			console.error(err);
		});
	}

	return (
		<div className='bg-red-700 h-full'>
			<button onClick={handleCall}>CALL</button>

		</div>
	);
}