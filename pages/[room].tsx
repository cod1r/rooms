import { useEffect, useState, useContext } from 'react';
import router from 'next/router';
import { AuthStates } from '../contexts/authstates';
export default function Room() {
	let authstates = useContext(AuthStates);
	let [current_room, setCurrentRoom] = useState('');
	let [peer, setPeer] = useState(null);
	let [audio, setAudio] = useState(null);
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
				authstates.setInRoom();
			}
		}).catch((err) => console.error(err));
		let audio_obj = new Audio();
		audio_obj.addEventListener('canplay', (e) => {
			console.log('things are happening');
		})
		setAudio(audio_obj);
		// cleans up after the component unmounts
		return () => {
			peer.destroy();
		};
	}, []);
	useEffect(() => {
		if (peer != null) {
			peer.on('open', (id) => {
				let { room } = router.query;
				setCurrentRoom(room);
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
						id: id
					}),
					signal: controller.signal
				}).then(async (res) => {
					clearTimeout(timeoutid_2);
					if (res.status == 200) {
						console.log('my peer id', id);
						let peerids = (await res.json())['peers'];
						console.log('peers', peerids);
						navigator.mediaDevices.getUserMedia({audio:true}).then((mediaStream) => {
							peer.on('call', (call) => {
								call.answer(mediaStream);
								console.log('somebody called me');
								call.on('stream', (remoteStream) => {
									audio.srcObject = remoteStream;
									console.log('open?', call.open);
									audio.play();
								});
							});
							peerids.forEach((peerid) => {
								if (peerid != id) {
									let call = peer.call(peerid, mediaStream);
									call.on('stream', (remoteStream) => {
										audio.srcObject = remoteStream;
										console.log('open?', call.open);
										audio.play();
									});
								}
							});
						}).catch(err => console.error(err));
					}
				});
			});
		}
	}, [peer]);
	return (
		<div className='h-full'>
			<div className='text-center'>
				{peer?.id}
			</div>
		</div>
	);
}
