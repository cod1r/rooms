import {
	useEffect,
	useState,
	useContext,
	useRef,
	Dispatch,
	SetStateAction,
} from 'react';
import router from 'next/router';
import { GLOBALS } from '../../../contexts/globals';

// the function that gets returned from a useEffect function is that function
// that cleans up the PREVIOUS effect

interface DataChannelDataType {
	name: string;
}

// TODO: close all mediaStream connections
let Video = (props: {
	peer: string;
	className?: string;
	key: number;
	mediaStream: MediaStream;
	muted: boolean;
}) => {
	let [isFullScreen, setIsFullScreen] = useState(false);
	let VideoRef = useRef(null);
	let ContainerRef = useRef(null);
	useEffect(() => {
		VideoRef.current.srcObject = props.mediaStream;
		ContainerRef.current.onfullscreenchange = (e) => {
			if (document.fullscreenElement !== null) {
				setIsFullScreen(true);
			} else {
				setIsFullScreen(false);
			}
		};
	}, [props.mediaStream]);
	return (
		<div
			ref={ContainerRef}
			key={props.key}
			className="bg-cyan-500 relative h-80 w-80 rounded grid place-items-center z-50"
		>
			<div className="absolute grid place-items-center z-0">
				<div className="text-white">{props.peer}</div>
			</div>
			<video
				ref={VideoRef}
				className="relative rounded z-10 h-full"
				autoPlay={true}
				muted={props.muted}
				playsInline={true}
			></video>
			{
				<div
					onClick={(e) => {
						ContainerRef.current.requestFullscreen().then(() => {
							setIsFullScreen(true);
						});
					}}
					className="absolute left-0 top-0 z-20 h-full w-full flex flex-col items-center"
				>
					{isFullScreen ? (
						<button
							className="p-2 bg-white text-black rounded"
							onClick={() => {
								document.exitFullscreen().then(() => {
									setIsFullScreen(false);
								});
							}}
						>
							Exit Fullscreen
						</button>
					) : null}
				</div>
			}
		</div>
	);
};

export default function Room() {
	let glbl = useContext(GLOBALS);
	let [Loaded, setLoaded] = useState(false);
	let [_MEDIA_STREAM_, setMediaStream]: [MediaStream, any] = useState(null);
	let [screenState, setScreenState] = useState(false);
	let [micState, setMicState] = useState(true);
	let [videoState, setVideoState] = useState(false);
	let [peerStreams, setPeerStreams] = useState([]);
	let [peer, setPeer] = useState(null);
	let [peerIds, setPeerIds] = useState(null);
	let [user, setUser] = useState('');
	let [dataChannelConnections, setDataChannelConnections] = useState(new Map());
	let [mediaConnections, setMediaConnections] = useState([]);
	let [videoOrScreen, setVideoOrScreen] = useState('');
	let [renegotiate, setRenegotiate] = useState(false);

	let [log, setLog] = useState('');

	useEffect(() => {
		(async () => {
			let Peer = (await import('peerjs')).default;
			setPeer(new Peer());
		})();

		// cleans up after the component unmounts
		return () => {
			let controller = new AbortController();
			let timeoutID = setTimeout(() => controller.abort(), 5000);
			fetch('/api/leaveroom', {
				method: 'POST',
				signal: controller.signal,
			}).then((res) => {
				clearTimeout(timeoutID);
				if (res.status == 200) {
					glbl.setInRoom(false);
				} else {
					console.log('leave room status not 200');
				}
			});
		};
	}, []);

	useEffect(() => {
		console.log('[room] useeffect here; authenticated:', glbl.authenticated);
		if (glbl.authenticated && peer !== null) {
			glbl.setInRoom(true);

			peer.on('error', (e) => {
				console.error('PEER ERROR', e);
			});
			peer.on('open', (id) => {
				setRenegotiate(true);
			});
		}
	}, [glbl.authenticated, peer]);

	useEffect(() => {
		// closes all mediaConnections and dataChannels
		setMediaConnections((pmc) => {
			pmc.forEach((mediaConnection) => mediaConnection.close());
			return pmc;
		});
		setMediaConnections([]);
		setDataChannelConnections((pdc) => {
			Array.from(pdc.values()).forEach((conn) => conn.close());
			return pdc;
		});
		setDataChannelConnections(new Map());
		setPeerStreams((ps) => {
			ps.forEach((s) => s.close());
			return ps;
		});
		setPeerStreams([]);

		if (peer !== null && renegotiate === true) {
			let { room, user } = router.query;
			let controller = new AbortController();
			let timeoutid_2 = setTimeout(() => {
				router.push('/');
				controller.abort();
			}, 5000);
			fetch('/api/joinroom', {
				method: 'POST',
				body: JSON.stringify({
					roomname: room,
					id: peer.id,
					user: user,
				}),
				signal: controller.signal,
			}).then(async (res) => {
				clearTimeout(timeoutid_2);
				if (res.status == 200) {
					console.log('joinroom api status 200');
					let { peerids, username } = await res.json();
					setUser(username);
					setPeerIds(peerids);

					setMicState(true);

					if (_MEDIA_STREAM_ !== null) setLoaded(true);
				} else {
					router.push('/');
				}
			});
		}
	}, [renegotiate, peer]);

	useEffect(() => {
		if (
			_MEDIA_STREAM_ !== null &&
			user.length > 0 &&
			peer !== null &&
			peerIds !== null
		) {
			// renegotiate with peers
			peerIds.forEach((peerid) => {
				if (peerid !== peer.id) {
					let call = peer.call(peerid, _MEDIA_STREAM_);
					call.on('error', (e) => {
						console.error(e);
					});
					call.on('stream', (remoteStream: MediaStream) => {
						setPeerStreams((p) => [...p, remoteStream]);
						console.log('open?', call.open);
					});
					setMediaConnections((m) => [...m, call]);

					let conn = peer.connect(peerid);
					conn.on('open', () => {
						conn.on('data', (data: DataChannelDataType) => {
							// we create a new map in order to trigger a rerender
							setDataChannelConnections((prevDataChannelConnections) => {
								prevDataChannelConnections.set(data.name, conn);
								return new Map(prevDataChannelConnections.entries());
							});
						});
						conn.send({ name: user });
					});
					conn.on('error', (e) => {
						console.log('conn error', e);
					});
				}
			});

			peer.on('call', (call) => {
				call.on('error', (e) => {
					console.error('ERROR', e);
				});
				call.answer(_MEDIA_STREAM_);
				console.log('somebody called me');
				call.on('stream', (remoteStream: MediaStream) => {
					setPeerStreams((p) => [...p, remoteStream]);
					console.log('open?', call.open);
				});
			});

			peer.on('connection', (conn) => {
				conn.on('open', () => {
					conn.on('data', (data: DataChannelDataType) => {
						conn.on('close', () => {
							setDataChannelConnections(
								(pdc) =>
									new Map(
										Array.from(pdc.entries()).filter(
											(keyValuePair) => keyValuePair[1].peer !== conn.peer
										)
									)
							);
						});
						// we create a new map in order to trigger a rerender
						setDataChannelConnections((prevDataChannelConnections) => {
							prevDataChannelConnections.set(data.name, conn);
							return new Map(prevDataChannelConnections.entries());
						});
					});
					conn.send({ name: user });
				});
				conn.on('error', (e) => {
					console.log('conn error', e);
				});
			});
		}
	}, [peerIds, _MEDIA_STREAM_, user, peer]);

	useEffect(() => {
		if (screenState === true && peerIds !== null && peer !== null) {
			navigator.mediaDevices
				.getDisplayMedia({ audio: true, video: true })
				.then(
					(mediaStream) => {
						setMediaStream(mediaStream);
						setRenegotiate(true);
						setVideoOrScreen('screen');
					},
					(rejected) => {
						console.error('screen rejected');
					}
				)
				.catch((e) => console.error(e));
		} else {
			_MEDIA_STREAM_?.getTracks().forEach((track) => track.stop());
			setVideoOrScreen('');
		}
	}, [screenState]);

	useEffect(() => {
		if (_MEDIA_STREAM_ === null) {
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then(
					(mediaStream) => {
						setMediaStream(mediaStream);
					},
					(rejected) => {
						console.error('rejected');
						router.push('/home');
					}
				)
				.catch((e) => console.error(e));
		} else {
			_MEDIA_STREAM_
				.getAudioTracks()
				.forEach((track) => (track.enabled = micState));
		}
	}, [micState, _MEDIA_STREAM_]);

	useEffect(() => {
		if (videoState === true && peerIds !== null && peer !== null) {
			navigator.mediaDevices
				.getUserMedia({ audio: true, video: true })
				.then(
					(mediaStream) => {
						setMediaStream(mediaStream);
						setRenegotiate(true);
						setVideoOrScreen('video');
					},
					(rejection) => {
						console.error('video rejected');
					}
				)
				.catch((e) => console.error(e));
		} else {
			_MEDIA_STREAM_
				?.getVideoTracks()
				.forEach((track: MediaStreamTrack) => track.stop());
			setVideoOrScreen('');
		}
	}, [videoState]);

	// this is to stop our media stream after unmounting
	useEffect(() => {
		return () => {
			_MEDIA_STREAM_?.getTracks().forEach((track) => track.stop());
		};
	}, [_MEDIA_STREAM_]);

	return Loaded !== null && glbl.authenticated === true ? (
		<div className="h-full bg-cyan-600 flex flex-col items-center">
			<div className="text-white">{log}</div>
			<div className="h-full w-full text-white grid auto-rows-min auto-cols-min grid-flow-row">
				{Array.from(dataChannelConnections.keys()).map((peer, index) => (
					<Video
						peer={peer}
						muted={false}
						key={index}
						mediaStream={peerStreams[index]}
					/>
				))}
			</div>
			<Video peer={user} key={-1} mediaStream={_MEDIA_STREAM_} muted={true} />
			<div className="flex justify-center sticky bottom-0">
				<button
					className="p-2 m-2 bg-white rounded shadow-md"
					onClick={() => router.push('/home')}
				>
					Leave
				</button>
				<button
					className="p-2 m-2 bg-white rounded shadow-md"
					onClick={() => setMicState((prevMicState) => !prevMicState)}
				>
					{micState ? 'Microphone' : <s>Microphone</s>}
				</button>
				<button
					className="p-2 m-2 bg-white rounded shadow-md"
					onClick={() => setVideoState((prevVideoState) => !prevVideoState)}
				>
					{videoOrScreen === 'video' ? 'Video' : <s>Video</s>}
				</button>
				<button
					className="p-2 m-2 bg-white rounded shadow-md"
					onClick={() => setScreenState((prevScreenState) => !prevScreenState)}
				>
					{videoOrScreen === 'screen' ? 'Screen' : <s>Screen</s>}
				</button>
			</div>
		</div>
	) : (
		'Loading...'
	);
}
