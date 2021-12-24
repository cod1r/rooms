import { useEffect, useState, useContext } from 'react';
import router from 'next/router';
import { GLOBALS } from '../contexts/globals';

export default function Room() {
	let glbl = useContext(GLOBALS);
	let [Loaded, setLoaded] = useState(false);
	let [MicrophoneMediaStream, setMicrophoneMediaStream] = useState(null);
	let [MicMuted, setMicMuted] = useState(true);
	let [audioMuted, setAudioMuted] = useState(null);
	let [peer, setPeer] = useState(null);
	let [audio, setAudio] = useState(null);
	let [usersInRoom, setUsersInRoom] = useState([]);
	let [dataChannelConnection, setDataChannelConnection] = useState(null);

	let ChangeMicrophoneState = (peerids = [], username = '', usersInRoomFromFetch = []) => {
		if (MicrophoneMediaStream === null) {
			navigator.mediaDevices.getUserMedia({ audio: true }).then(mediaStream => {
				setMicrophoneMediaStream(mediaStream);
				setMicMuted(false);

				peer.on('call', (call) => {
					call.on('error', (e) => {
						console.error('ERROR', e);
					});
					call.answer(mediaStream);
					console.log('somebody called me');
					call.on('stream', (remoteStream: MediaStream) => {
						if (audio.srcObject === null) {
							audio.srcObject = remoteStream;
						}
						else {
							remoteStream.getAudioTracks().forEach(track => audio.srcObject.addTrack(track));
						}
						console.log('open?', call.open);
					});
				});
				peer.on('connection', (conn) => {
					conn.on('open', () => {
						conn.on('data', (data: string) => {
							setUsersInRoom([...usersInRoomFromFetch, data]);
						});
						conn.send(username);
					});
					conn.on('error', (e) => {
						console.log('conn error', e);
					});
					setDataChannelConnection(conn);
				});

				peerids.forEach((peerid) => {
					if (peerid != peer.id) {
						let call = peer.call(peerid, mediaStream);
						call.on('error', (e) => {
							console.error(e);
						});
						call.on('stream', (remoteStream: MediaStream) => {
							if (audio.srcObject === null) {
								audio.srcObject = remoteStream;
							}
							else {
								remoteStream.getAudioTracks().forEach(track => audio.srcObject.addTrack(track));
							}
							console.log('open?', call.open);
						});

						let conn = peer.connect(peerid);
						conn.on('open', () => {
							conn.on('data', (data: string) => {
								setUsersInRoom([...usersInRoomFromFetch, data]);
							});
							conn.send(username);
						});
						conn.on('error', (e) => {
							console.log('conn error', e);
						});
						setDataChannelConnection(conn);
					}
				});
			}, rejection => {
				console.error("microphone rejected");
				router.push('/home');
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
				() => {
					setAudioMuted(false);
					console.log('accepted');
				},
				(e) => { 
					console.error('rejected', e); 
					setAudioMuted(null); 
				}
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
		setAudio(a);
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
						let { peerids, username } = await res.json();
						// because setState is async, we have to pass in a temporary current value for 
						// the usersInRoom into ChangeMicrophoneState, IDK if this would be ideal but if
						// I don't do this, I would have to write another useEffect to reload our component 
						// whenever usersInRoom actually updates
						setUsersInRoom([...usersInRoom, username]);

						ChangeMicrophoneState(peerids, username, [...usersInRoom, username]);

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
		Loaded !== null && glbl.authenticated === true ?
			<div className='h-screen bg-black flex flex-col items-center'>
				<ul className='text-white overflow-y-auto w-full overflow-x-hidden h-full text-center'>
					{ usersInRoom.map((user, index) => <li key={index} className='p-2 m-1'>{user}</li>) }
				</ul>
				<div className='flex justify-center'>
					<button 
						className='p-2 m-2 bg-white rounded-sm' 
						onClick={() => {router.push('/home');}}>
						Leave room
					</button>
					<button 
						className='p-2 m-2 bg-white rounded-sm'
						onClick={() => ChangeMicrophoneState()}>
						{ MicMuted ? <s>Microphone</s> : <>Microphone</> }
					</button>
					<button
						className='p-2 m-2 bg-white rounded-sm'
						onClick={ChangeAudioState}>
						{ audioMuted === null || audioMuted ? <s>Sound</s> : <>Sound</> }
					</button>
				</div>
			</div>
		:
		'Loading...'
	);
}
