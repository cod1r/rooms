import { useEffect, useState, useContext } from 'react';
import router from 'next/router';
import { AuthStates } from '../contexts/authstates';
export default function Room() {
	let authstates = useContext(AuthStates);
	let [Loaded, setLoaded] = useState(false);
	let [mediastream, setmediastream] = useState(null);
	let [peer, setPeer] = useState(null);
	let [audio_obj, setAudio] = useState(null);

	useEffect(() => {
		(async () => {
			let Peer = (await import('peerjs')).default;
			setPeer(new Peer());
		})();
	}, []);

	useEffect(() => {
		console.log('[room] useeffect here; authenticated:', authstates.authenticated);
		if (authstates.authenticated && peer !== null) {
			authstates.setInRoom(true);
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
							let peerids = (await res.json())['peers'];
							console.log('peers', peerids);
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
						authstates.setInRoom(false);
					}
					else {
						console.log('leave room status not 200');
					}
				});
			};
		}
	}, [authstates.authenticated, peer]);

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
		<div className='h-full'>
			<div className='text-center'>
				{ 
					Loaded !== null && authstates.authenticated === true ?
					<button onClick={() => {
						router.push('/');
					}}>Leave room</button>
					:
					'Loading...'
				}
			</div>
		</div>
	);
}
