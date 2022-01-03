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
import Link from 'next/link';

// the function that gets returned from a useEffect function is that function
// that cleans up the PREVIOUS effect

interface DataChannelDataType {
	name: string;
	peerid: string;
}

let Video = (props: {
	peer: string;
	className?: string;
	mediaStream: MediaStream;
	muted: boolean;
}) => {
	let [isFullScreen, setIsFullScreen] = useState(false);
	let VideoRef = useRef(null);
	let ContainerRef = useRef(null);
	let [UI, setUI] = useState(false);
	useEffect(() => {
		VideoRef.current.srcObject = props.mediaStream;
		ContainerRef.current.onfullscreenchange = (e) => {
			if (document.fullscreenElement !== null) {
				setIsFullScreen(true);
			} else {
				setIsFullScreen(false);
			}
		};
	}, [props.mediaStream, props.peer]);
	return (
		<div
			ref={ContainerRef}
			className="bg-cyan-500 relative h-full w-full rounded grid place-items-center z-50"
		>
			<div className="text-white absolute grid place-items-center z-0 overflow-hidden text-ellipsis w-full">
				{props.peer}
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
					onClick={() => {
						if (ContainerRef.current.requestFullscreen) {
							ContainerRef.current.requestFullscreen().then(() => {
								setIsFullScreen(true);
							});
						} else if (ContainerRef.current.webkitRequestFullscreen) {
							ContainerRef.current.webkitRequestFullscreen();
							setIsFullScreen(true);
						}
					}}
					onMouseEnter={() => setUI(true)}
					onMouseLeave={() => setUI(false)}
					className="absolute left-0 top-0 z-20 h-full w-full flex flex-col items-center"
				>
					{isFullScreen ? (
						<button
							className="p-2 bg-white text-black rounded"
							onClick={() => {
								if (document.exitFullscreen) {
									document.exitFullscreen().then(() => {
										setIsFullScreen(false);
									});
									// @ts-ignore
								} else if (document.webkitExitFullscreen) {
									// @ts-ignore
									document.webkitExitFullscreen();
									setIsFullScreen(false);
								}
							}}
						>
							Exit Fullscreen
						</button>
					) : null}
					{UI && !props.muted ? (
						<button
							className="bg-white p-2 text-black rounded absolute right-0 bottom-0"
							onClick={(e) => {
								VideoRef.current.muted = !VideoRef.current.muted;
								e.stopPropagation();
							}}
						>
							{VideoRef.current.muted ? 'unmute' : 'mute'}
						</button>
					) : null}
				</div>
			}
		</div>
	);
};

let useConnect = () => {
	let [peer, setPeer] = useState(null);
	let [peerIds, setPeerIds] = useState([]);
	let [username, setUsername] = useState('');
	useEffect(() => {
		(async () => {
			let Peer = (await import('peerjs')).default;
			setPeer(new Peer());
		})();
	}, []);
	useEffect(() => {
		let { room, user } = router.query;
		if (peer !== null) {
			peer.on('open', (id) => {
				fetch('/api/joinroom', {
					method: 'POST',
					body: JSON.stringify({
						roomname: room,
						user: user,
						id: peer.id,
					}),
				}).then(async (res) => {
					if (res.ok) {
						let { peerids, username } = await res.json();
						setPeerIds(peerids.filter((peerid) => peerid !== peer.id));
						setUsername(username);
					}
				});
			});
		}
	}, [peer]);
	return { peer: peer, peerIds: peerIds, username: username };
};

export default function Room() {
	let glbl = useContext(GLOBALS);
	let { peer, peerIds, username } = useConnect();
	let [_PEERIDS_, setPEERIDS]: [Array<string>, any] = useState([]);
	let [Loaded, setLoaded] = useState(false);
	let [_MEDIA_STREAM_, setMediaStream]: [MediaStream, any] = useState(
		new MediaStream()
	);
	let [micState, setMicState] = useState(null);
	let [peerStreams, setPeerStreams]: [
		Array<{ call: any; stream: MediaStream; name: string }>,
		any
	] = useState([]);
	let [peerChannels, setPeerChannels] = useState([]);
	let [peerCalls, setPeerCalls] = useState([]);
	let [now, setNow] = useState(0);
	let msRef = useRef(_MEDIA_STREAM_);
	let peerRef = useRef(peer);
	let peerChannelsRef = useRef(peerChannels);
	let timerID = useRef(null);

	useEffect(() => {
		setMicState(true);
		let tid = setInterval(() => setNow((n) => n + 1), 1000);
		timerID.current = tid;
		// cleans up after the component unmounts
		return () => {
			let controller = new AbortController();
			let timeoutID = setTimeout(() => controller.abort(), 5000);
			msRef.current
				.getTracks()
				.forEach((track: MediaStreamTrack) => track.stop());
			peerChannelsRef.current.forEach((conn) => conn.close());
			peerRef.current.destroy();
			clearTimeout(timerID.current);
			//console.log('destroyed?', peerRef.current);
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
		if (peerIds.length > 0) {
			setPEERIDS(peerIds);
		}
	}, [peerIds]);

	useEffect(() => {
		if (peer !== null && _MEDIA_STREAM_.active && username.length > 0) {
			peerRef.current = peer;
			peer.on('call', (call) => {
				call.on('error', (e) => {
					console.error('ERROR', e);
				});
				call.answer(_MEDIA_STREAM_);
				console.log('somebody called me', _MEDIA_STREAM_);
				call.on('stream', (remoteStream: MediaStream) => {
					setPeerStreams((prevPeerStreams) => {
						return [
							...prevPeerStreams,
							{ call: call, stream: remoteStream, name: null },
						];
					});
					console.log('open?', call.open);
				});
				call.on('close', () => {
					console.log(call.peer, 'closed');
				});
			});

			peer.on('connection', (conn) => {
				conn.on('open', () => {
					conn.on('data', (data: DataChannelDataType) => {
						// this is to match the names with the streams
						setPeerStreams((prevPeerStreams) => {
							prevPeerStreams.forEach((peerStream) => {
								if (peerStream.call.peer === data.peerid) {
									peerStream.name = data.name;
								}
							});
							return [...prevPeerStreams];
						});
					});
					conn.send({ name: username, peerid: peer.id });
				});
				conn.on('error', (e) => {
					console.log('conn error', e);
				});
				conn.on('close', () => {
					console.log(conn.peer, 'ended0', peerRef.current);
					setPeerStreams((prevPeerStreams) => {
						console.log(
							'find?',
							prevPeerStreams.find(
								(peerStream) => peerStream.call.peer === conn.peer
							)
						);
						return prevPeerStreams.filter(
							(peerStream) => peerStream.call.peer !== conn.peer
						);
					});
				});
				setPeerChannels((prevPeerChannel) => {
					let newPeerChannels = [...prevPeerChannel, conn];
					peerChannelsRef.current = newPeerChannels;
					return newPeerChannels;
				});
			});
		}
	}, [peer, _MEDIA_STREAM_, username]);

	useEffect(() => {
		if (_MEDIA_STREAM_.active && username.length > 0 && peer !== null) {
			msRef.current = _MEDIA_STREAM_;
			console.log('calling peers');
			_PEERIDS_.forEach((peerid) => {
				if (
					peerid !== peer.id &&
					!peerChannelsRef.current.find(
						(peerChannel) => peerChannel.peer === peerid
					)
				) {
					console.log('ms', _MEDIA_STREAM_);
					let call = peer.call(peerid, _MEDIA_STREAM_);
					call.on('error', (e) => {
						console.error(e);
					});
					call.on('stream', (remoteStream: MediaStream) => {
						setPeerStreams((prevPeerStreams) => {
							return [
								...prevPeerStreams,
								{ call: call, stream: remoteStream, name: null },
							];
						});
						console.log('open?', call.open);
					});
					call.on('close', () => {
						console.log(call.peer, 'closed1');
					});

					let conn = peer.connect(peerid);
					conn.on('open', () => {
						conn.on('data', (data: DataChannelDataType) => {
							// this is to match the names with the streams
							setPeerStreams((prevPeerStreams) => {
								prevPeerStreams.forEach((peerStream) => {
									if (peerStream.call.peer === data.peerid) {
										peerStream.name = data.name;
									}
								});
								return [...prevPeerStreams];
							});
						});
						conn.send({ name: username, peerid: peer.id });
					});
					conn.on('error', (e) => {
						console.log('conn error', e);
					});
					conn.on('close', () => {
						console.log(conn.peer, 'ended1', peerRef.current);
						setPeerStreams((prevPeerStreams) => {
							return prevPeerStreams.filter(
								(peerStream) => peerStream.call.peer !== conn.peer
							);
						});
					});
					setPeerChannels((prevPeerChannel) => {
						let newPeerChannels = [...prevPeerChannel, conn];
						peerChannelsRef.current = newPeerChannels;
						return newPeerChannels;
					});
				}
			});
		}
	}, [_PEERIDS_, _MEDIA_STREAM_, username, peer]);

	useEffect(() => {
		if (glbl.authenticated) {
			glbl.setInRoom(true);
		}
	}, [glbl.authenticated]);

	useEffect(() => {
		if (micState === null) {
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then((mediaStream) => {
					setMediaStream(mediaStream);
				})
				.catch((e) => {
					console.error('mic rejected');
					router.push('/');
				});
		} else {
			msRef.current?.getTracks().forEach((track) => (track.enabled = micState));
		}
	}, [micState]);

	return Loaded !== null && glbl.authenticated === true ? (
		<div className="h-full w-full bg-cyan-600 flex flex-col items-center">
			<div className="h-full w-full text-white grid gap-1 grid-cols-4 overflow-x-hidden">
				<Video
					key={-1}
					peer={username}
					mediaStream={_MEDIA_STREAM_}
					muted={true}
				/>
				{peerStreams.map((peer, index: number) => (
					<Video
						key={index}
						peer={peer.name}
						muted={false}
						mediaStream={peer.stream}
					/>
				))}
			</div>
			<div className="flex justify-center fixed z-50 bottom-0 text-center w-full">
				<div className="w-1/2 grid grid-cols-3">
					<Link href="/home">
						<a className="p-2 m-2 bg-white rounded shadow-md overflow-hidden text-ellipsis">
							Leave
						</a>
					</Link>
					<button
						className="p-2 m-2 bg-white rounded shadow-m overflow-hidden text-ellipsis"
						onClick={() => setMicState((prevMicState) => !prevMicState)}
					>
						{micState ? 'Microphone' : <s>Microphone</s>}
					</button>
					<div className="p-2 m-2 bg-white rounded shadow-md overflow-hidden text-ellipsis">
						{(() => {
							let seconds = now;
							let minutes = Math.floor(seconds / 60);
							let hours = Math.floor(minutes / 60);
							let convert = (val, mod) =>
								val % mod >= 10 ? val % mod : '0' + String(val % mod);
							return `${convert(hours, 24)}:${convert(minutes, 60)}:${convert(
								seconds,
								60
							)}`;
						})()}
					</div>
				</div>
			</div>
		</div>
	) : (
		'Loading...'
	);
}
