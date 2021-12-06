import { useEffect, useState, useContext } from 'react';
import router from 'next/router';
import { GLOBALS } from '../contexts/globals';
export default function Room() {
	let glbl = useContext(GLOBALS);
	let [Loaded, setLoaded] = useState(false);
	let [mediastream, setmediastream] = useState(null);
	let [peer, setPeer] = useState(null);
	let [audio_obj, setAudio] = useState(null);
	let [users, setUsers] = useState(null);

	useEffect(() => {
		(async () => {
			let Peer = (await import('peerjs')).default;
			setPeer(new Peer());
		})();
	}, []);

	useEffect(() => {
		console.log('[room] useeffect here; authenticated:', glbl.authenticated);
		if (glbl.authenticated && peer !== null) {
			glbl.setInRoom(true);
			let audio = new Audio();
			setAudio(audio);
			navigator.mediaDevices.getUserMedia({audio:true}).then((mediaStream) => {
				setmediastream(mediaStream);
				peer.on('open', (id) => {
					console.log('my id', id);
					let { room } = router.query;
					let controller = new AbortController();
					let timeoutid_2 = setTimeout(() => {
						router.push('/');
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
							console.log('joinroom api status 200');
							let users = await res.json();
							setUsers(Object.keys(users));
							console.log('peers', users);
							// TODO: based on how we are reassigning the audio's
							// srcobject, we can only hear one person at a time.
							peer.on('call', (call) => {
								call.answer(mediaStream);
								console.log('somebody called me');
								call.on('stream', (remoteStream) => {
									audio.srcObject = remoteStream;
									console.log('open?', call.open);
									audio.play();
								});
							});
							Object.values(users).forEach((peerid) => {
								if (peerid != id) {
									console.log('calling', peerid);
									let call = peer.call(peerid, mediaStream);
									call.on('stream', (remoteStream) => {
										audio.srcObject = remoteStream;
										console.log('open?', call.open);
										audio.play();
									});
								}
							});
							setLoaded(true);
						}
					});
				});
			}).catch(err => console.error(err));
			// cleans up after the component unmounts
			return () => {
				let controller = new AbortController();
				let timeoutID = setTimeout(() => controller.abort(), 5000);
				fetch('api/leaveroom', {
					method: 'POST',
					signal: controller.signal
				}).then((res) => {
					clearTimeout(timeoutID);
					if (res.status == 200) {
						glbl.setInRoom(false);
					}
					else {
						console.log('leave room status not 200');
					}
				});
			};
		}
	}, [glbl.authenticated, peer]);

	useEffect(() => {
			return () => {
				mediastream?.getAudioTracks().forEach(track => track.stop());
			};
	}, [mediastream]);

	useEffect(() => {
		return () => {
			if (audio_obj !== null) {
				audio_obj.srcObject = null;
				console.log('audio_obj', audio_obj.srcObject);
			}
		}
	}, [audio_obj]);
	return (
		<div className='h-full bg-gradient-to-br from-blue-400 to-green-400'>
			<div className='text-center bg-white'>
				{ 
					Loaded !== null && glbl.authenticated === true ?
					<button className='p-2 m-2 bg-green-400 rounded-sm text-white' onClick={() => {
						router.push('/home');
					}}>Leave room</button>
					:
					'Loading...'
				}
			</div>
		</div>
	);
}
