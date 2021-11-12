import { useEffect, useState, useContext } from 'react';
import router from 'next/router';
import { AuthStates } from '../contexts/authstates';
export default function Room() {
	let authstates = useContext(AuthStates);
	let [current_room, setCurrentRoom] = useState('');
	let [peer, setPeer] = useState(null);
	useEffect(() => {
		(async () => {
			let Peer = (await import('peerjs')).default;
			setPeer(new Peer());
		})();
		let controller = new AbortController();
		let timeoutID = setTimeout(() => { 
			router.push('/');
			authstates.setInRoom();
			controller.abort(); 
			console.log('timeout function called'); 
		}, 5000);
		fetch('api/authenticate', {
			method: 'POST',
			signal: controller.signal
		}).then(async (res) => {
			clearTimeout(timeoutID);
			if (res.status == 200) {
				authstates.setAuthenticated();
			}
		}).catch((err) => console.error(err));
	}, []);
	useEffect(() => {
		if (peer != null) {
			let { room } = router.query;
			setCurrentRoom(room);
			let audio = new Audio();
			let controller = new AbortController();
			let timeoutid_2 = setTimeout(() => {
				router.push('/');
				authstates.setInRoom();
				controller.abort();
			}, 5000);
			fetch('api/joinroom', {
				method: 'POST',
				body: JSON.stringify({
					roomname: room,
					id: peer.id
				}),
				signal: controller.signal
			}).then(async (res) => {
				clearTimeout(timeoutid_2);
				if (res.status == 200) {
					console.log('my peer id', peer.id);
					let peerids = (await res.json())['peers'];
					console.log('peers', peerids);
					navigator.mediaDevices.getUserMedia({audio:true}).then((stream) => {
						peerids.forEach((peerid) => {
							if (peerid != peer.id) {
								let call = peer.call(peerid, stream);
								peer.on('call', (call) => {
									call.answer(stream);
								});
								call.on('stream', (remoteStream) => {
									audio.srcObject = remoteStream;
									//audio.play();
								});
							}
						})
					}).catch(err => console.error(err));
				}
			});
			audio.addEventListener('canplaythrough', (e) => {
				console.log('things are happening');
			})
		}
	}, [peer]);
	return (
		<div className='h-full'>
			<div className='text-center'>
				{current_room}
			</div>
		</div>
	);
}
