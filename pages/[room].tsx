import { useEffect, useState, useContext } from 'react';
import router from 'next/router';
import { AuthStates } from '../contexts/authstates';
export default function Room() {
	let authstates = useContext(AuthStates);
	let [peer, setPeer] = useState(null);
	let [audio, setAudio] = useState(null);
	let [mediaStream, setMediaStream] = useState(null);
	useEffect(() => {
		authstates.setInRoom(true);
		(async () => {
			let Peer = (await import('peerjs')).default;
			setPeer(new Peer());
		})();
		let audio_obj = new Audio();
		navigator.mediaDevices.getUserMedia({audio:true}).then((mediaStream) => {
			setMediaStream(mediaStream);
		}).catch(err => console.error(err));
		//audio_obj.addEventListener('canplay', (e) => {
		//	console.log('things are happening');
		//})
		setAudio(audio_obj);
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
	}, []);
	useEffect(() => {
		if (peer != null) {
			peer.on('open', (id) => {
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
						let peerids = (await res.json())['peers'];
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
					}
				});
			});
		}
	}, [peer]);
	return (
		<div className='h-full'>
			<div className='text-center'>
				{ 
					mediaStream !== null ?
					<button onClick={() => {
						mediaStream.getAudioTracks().forEach(track => track.stop());
						router.push('/');
					}}>Leave room</button>
					:
					'Loading...'
				}
			</div>
		</div>
	);
}
