import { useEffect, useState, useContext } from 'react';
import router from 'next/router';
import { GLOBALS } from '../contexts/globals';


export default function Room() {
	let glbl = useContext(GLOBALS);
	let [Loaded, setLoaded] = useState(false);
	let [MicrophoneMediaStream, setMicrophoneMediaStream] = useState(null);
	let [MicMuted, setMicMuted] = useState(true);
	let [audioMuted, setAudioMuted] = useState(null);
	let [UserMediaStreams, setUserMediaStreams] = useState([]);
	let [sourceMediaStream, setSourceMediaStream] = useState(null);
	let [peer, setPeer] = useState(null);
	let [audio, setAudio] = useState(null);
	let [usersInRoom, setUsersInRoom] = useState({});
	let [debugMsg, setDebugMsg] = useState("");

	let ChangeMicrophoneState = (users = {}) => {
		if (MicrophoneMediaStream === null) {
			navigator.mediaDevices.getUserMedia({ audio: true }).then(mediaStream => {
				setMicrophoneMediaStream(mediaStream);
				setMicMuted(false);
				// TODO: based on how we are reassigning the audio's
				// srcobject, we can only hear one person at a time.
				peer.on('call', (call) => {
					call.on('error', (e) => {
						console.error('ERROR', e);
					});
					call.answer(mediaStream);
					console.log('somebody called me');
					console.log('ms', mediaStream);
					call.on('stream', (remoteStream: MediaStream) => {
						remoteStream.getAudioTracks().forEach(track => sourceMediaStream.addTrack(track));
						remoteStream.onaddtrack = (e: MediaStreamTrackEvent) => {
							console.log('track added');
							sourceMediaStream.addTrack(e.track);
						}
						setUserMediaStreams([...UserMediaStreams, remoteStream]);
						console.log(remoteStream);
						console.log('open?', call.open);
					});
				});
				Object.values(users).forEach((peerid) => {
					if (peerid != peer.id) {
						console.log('calling', peerid);
						let call = peer.call(peerid, mediaStream);
						call.on('error', (e) => {
							console.error(e);
						});
						call.on('stream', (remoteStream: MediaStream) => {
							remoteStream.getAudioTracks().forEach(track => sourceMediaStream.addTrack(track));
							remoteStream.onaddtrack = (e: MediaStreamTrackEvent) => {
								console.log('track added');
								sourceMediaStream.addTrack(e.track);
							}
							setUserMediaStreams([...UserMediaStreams, remoteStream]);
							console.log(remoteStream);
							console.log('open?', call.open);
						});
					}
				});
			}, rejection => {
				console.error("microphone rejected");
			}).catch((e) => console.error(e));
		}
		else {
			MicrophoneMediaStream?.getAudioTracks().forEach((track: MediaStreamTrack) => track.enabled = MicMuted);
			setMicMuted(!MicMuted);
		}
	};

	let ChangeAudioState = () => {
		if (audioMuted === null) {
			audio.play().then(
				() => setAudioMuted(false), 
				(e) => { 
					console.error('rejected', e); 
					setAudioMuted(null); }
			).catch((e) => {
						console.error(e);
						setAudioMuted(null);
					});
		}
		else if (audioMuted === true) {
			audio.muted = false;
			setAudioMuted(false);
		}
		else {
			audio.muted = true;
			setAudioMuted(true);
		}
	};

	useEffect(() => {
		(async () => {
			let Peer = (await import('peerjs')).default;
			setPeer(new Peer());
		})();
		let a = new Audio();
		let m = new MediaStream();
		setAudio(a);
		setSourceMediaStream(m);
		a.srcObject = m;
		a.onplay = (e: Event) => {
			console.log('onplay');
			setAudioMuted(false);
		}
	}, []);

	useEffect(() => {
		console.log('[room] useeffect here; authenticated:', glbl.authenticated);
		if (glbl.authenticated && peer !== null) {
			glbl.setInRoom(true);

			ChangeAudioState();

			peer.on('error', (e) => {
				console.error('PEER ERROR', e);
			});
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
						setUsersInRoom(users);
						// TODO: based on how we are reassigning the audio's
						// srcobject, we can only hear one person at a time.

						ChangeMicrophoneState(users);

						if (MicrophoneMediaStream !== null) 
							setLoaded(true);
					}
				});
			});


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

	// this is to stop the microphone once the user has left the audio room
	useEffect(() => {
			return () => {
				MicrophoneMediaStream?.getAudioTracks().forEach(track => track.stop());
			};
	}, [MicrophoneMediaStream]);

	// this is to stop all audio from playing once user has left
	useEffect(() => {
		return () => {
			if (audio !== null) {
				audio.srcObject = null;
			}
		}
	}, [audio]);
	return (
		<div className='h-full bg-gradient-to-br from-blue-400 to-green-400'>
			<div className='text-center bg-white'>
				{ 
					Loaded !== null && glbl.authenticated === true ?
					<>
						<button 
							className='p-2 m-2 bg-green-400 rounded-sm text-white' 
							onClick={() => {router.push('/home');}}>
							Leave room
						</button>
						<button 
							className='p-2 m-2 bg-green-400 rounded-sm text-white'
							onClick={ChangeMicrophoneState}>
							{ MicMuted ? <s>Microphone</s> : <>Microphone</> }
						</button>
						<button
							className='p-2 m-2 bg-green-400 rounded-sm text-white'
							onClick={ChangeAudioState}>
							{ audioMuted === null || audioMuted ? <s>Sound</s> : <>Sound</> }
						</button>
						<button onClick={() => console.log(audioMuted)}>PRINT</button>
						<button onClick={() => console.log('ms', sourceMediaStream.active)}>DEBUG</button>
						<button onClick={() => console.dir(audio)}>AUDIO</button>
						<button onClick={() => console.log(audio.paused)}>PAUSED</button>
						<button onClick={() => console.log(audio.readyState)}>RDYSTATE</button>
						<button onClick={() => console.log(audio.ended)}>ENDED</button>
					</>
					:
					'Loading...'
				}
			</div>
		</div>
	);
}
