import { useEffect, useState, useContext } from 'react';
import router from 'next/router';
import { GLOBALS } from '../contexts/globals';

// the function that gets returned from a useEffect function is that function 
// that cleans up the PREVIOUS effect

interface DataChannelDataType {
	name: string,
	disconnected: boolean
	message?: string
}

export default function Room() {
	let glbl = useContext(GLOBALS);
	let [Loaded, setLoaded] = useState(false);
	let [MicrophoneMediaStream, setMicrophoneMediaStream] = useState(null);
	let [MicMuted, setMicMuted] = useState(true);
	let [audioMuted, setAudioMuted] = useState(null);
	let [peer, setPeer] = useState(null);
	let [audio, setAudio] = useState(null);
	// this keeps the current user's username
	let [user, setUser] = useState('');
	let [dataChannelConnections, setDataChannelConnections]: [Map<string, any>, any] = useState(new Map());
	let [peerids, setPeerids] = useState([]);
	// logging because I can't see safari console.logs
	let [log, setLog] = useState('');

	let ChangeMicrophoneState = () => {
		if (MicrophoneMediaStream === null) {
			navigator.mediaDevices.getUserMedia({ audio: true }).then(mediaStream => {
				setMicrophoneMediaStream(mediaStream);
				setMicMuted(false);
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
						setUser(username);
						setPeerids(peerids);

						ChangeMicrophoneState();

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

	useEffect(() => {
		if (MicrophoneMediaStream !== null && peerids.length > 0) {
			peer.on('call', (call) => {
				call.on('error', (e) => {
					console.error('ERROR', e);
				});
				call.answer(MicrophoneMediaStream);
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
					conn.on('data', (data: DataChannelDataType) => {
						if (data.disconnected === false) {
							console.log('connecting', data.name);
							dataChannelConnections.set(data.name, conn);
						}
						else {
							console.log('disconnecting', data.name);
							dataChannelConnections.delete(data.name);
						}
						// we create a new map in order to trigger a rerender
						setDataChannelConnections(new Map(dataChannelConnections.entries()));
					});
					console.log('user', user);
					conn.send({name: user, disconnected: false});
				});
				conn.on('error', (e) => {
					console.log('conn error', e);
				});
			});

			peerids.forEach((peerid) => {
				if (peerid != peer.id) {
					let call = peer.call(peerid, MicrophoneMediaStream);
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
						conn.on('data', (data: DataChannelDataType) => {
							if (data.disconnected === false) {
								console.log('connecting', data.name);
								dataChannelConnections.set(data.name, conn);
							}
							else {
								console.log('disconnecting', data.name);
								dataChannelConnections.delete(data.name);
							}
							// we create a new map in order to trigger a rerender
							setDataChannelConnections(new Map(dataChannelConnections.entries()));
						});
						console.log('user', user);
						conn.send({name: user, disconnected: false});
					});
					conn.on('error', (e) => {
						console.log('conn error', e);
					});
				}
			});
		}
	}, [MicrophoneMediaStream, peerids]);

	useEffect(() => {
		return () => {
			if (user.length > 0 && dataChannelConnections.size > 0) {
				for (const key of Array.from(dataChannelConnections.keys())) {
					dataChannelConnections.get(key).send({name: user, disconnected: true});
				}
			}
		}
	}, [user]);

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
				<div className='text-white text-4xl'>{log}</div>
				<ul className='text-white overflow-y-auto w-full overflow-x-hidden h-full text-center'>
					<li className='p-2 m-1'>{user}</li>
					{ 
						Array.from(dataChannelConnections.keys()).map((peer, index) => 
							<li key={index} className='p-2 m-1'>
								{peer}
							</li>
						) 
					}
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
