import Link from 'next/link';
import { useRouter } from 'next/router';
import { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { GLOBALS } from '../contexts/globals';

// NOTE 1/21/2022 - I swapped to simple-peer. PeerJS is pretty much dead.

// IMPORTANT NOTES
// When a user joins a 'room', they are actually joining the signaling server's room, which is socket.io's room concept.
// After that user joins, that user emits a 'newJoin' event to all the other users in that 'room', which then prompts those that
// are already in that 'room' to generate a data Offer ( simple-peer ). That data offer gets sent to the signaling server by
// emitting the 'dataOffer' event. The signaling server then sends that offer to the user that is trying to join. Once
// that offer is sent, the user trying to join generates a data Answer to send to those that are already in the room. The data
// answer is sent to the signaling server by emitting the 'dataAnswer' event. Once the data answer is sent to the proper socket id
// connection, a p2p connection should be established.

interface DataConnection {
	name: string;
	dataConnection: any;
}

interface PeerMediaStream {
	name: string;
	mediaStream: MediaStream;
}

let Roomer = ({ name, isHost, Speaker, peer, username, mediaStream = null }) => {
	let [audio, setAudio] = useState(new Audio());
	useEffect(() => {
		audio.autoplay = true;
		audio.srcObject = mediaStream;
	}, [mediaStream, audio]);
	return (
		<div className='flex flex-col items-center shadow shadow-black m-1 rounded p-1 w-24'>
			<div className='rounded-full bg-black w-16 h-16'></div>
			<h3 className='text-ellipsis overflow-x-hidden w-full text-center dark:text-white'>{name}</h3>
			{isHost && name !== username
				? (
					<button
						className='bg-black p-2 text-white rounded'
						onClick={() => {
							peer.send('change');
						}}
					>
						{Speaker ? 'no talk' : 'allow talk'}
					</button>
				)
				: null}
		</div>
	);
};

let useConnect = () => {
	let router = useRouter();
	let [username, setUsername] = useState('');
	let [HostUsername, setHostUsername] = useState('');
	useEffect(() => {
		let { room } = router.query;
		fetch('/api/joinroom', {
			method: 'POST',
			body: JSON.stringify({
				roomid: room,
			}),
		}).then(async (res) => {
			if (res.ok) {
				let { usernameDB, HostUsernameDB } = await res.json();
				setUsername(usernameDB);
				setHostUsername(HostUsernameDB);
			} else {
				router.push('/home');
			}
		});
	}, []);
	return { username: username, HostUsername: HostUsername };
};

export default function Room() {
	let router = useRouter();
	let glbl = useContext(GLOBALS);
	let [isHost, setisHost] = useState(false);
	let [isSpeaker, setisSpeaker] = useState(false);
	let { username, HostUsername } = useConnect();
	let [Loaded, setLoaded] = useState(false);
	let [peerDataConnections, setPeerDataConnections]: [Array<DataConnection>, any] = useState([]);
	let [peerMediaInfo, setPeerMediaInfo]: [Array<PeerMediaStream>, any] = useState([]);
	let [speakers, setSpeakers]: [Array<DataConnection>, any] = useState([]);
	let [listeners, setListeners]: [Array<DataConnection>, any] = useState([]);
	let [userSearch, setUserSearch]: [string, any] = useState('');
	let [muteState, setMuteState] = useState(false);
	let [micState, setMicState] = useState(false);
	let [nonHostMicState, setNonHostMicState] = useState(false);
	let msRef: MutableRefObject<MediaStream> = useRef(null);
	let peerRef = useRef(null);
	let socketRef = useRef(null);
	let peerDataConnectionsRef: MutableRefObject<Array<DataConnection>> = useRef(peerDataConnections);
	let peerConnectionBuffer: MutableRefObject<Array<DataConnection>> = useRef([]);

	// effect is for cleaning up
	useEffect(() => {
		// cleans up after the component unmounts
		return () => {
			msRef.current
				?.getTracks()
				.forEach((track: MediaStreamTrack) => track.stop());
			socketRef.current.disconnect();
			socketRef.current = null;
			peerDataConnectionsRef.current.forEach((pdc: DataConnection) => pdc.dataConnection.destroy());
		};
	}, []);

	useEffect(() => {
		if (glbl.authenticated) {
			glbl.setInRoom(true);
		}
	}, [glbl.authenticated]);

	useEffect(() => {
		if (
			username.length > 0
			&& HostUsername.length > 0
		) {
			(async () => {
				let { io } = await import('socket.io-client');
				let socket = io('https://safe-retreat-90513.herokuapp.com/');
				socketRef.current = socket;

				let peer = (await import('simple-peer')).default;
				peerRef.current = peer;

				let { room } = router.query;
				socket.emit('room', room, username);

				// whenever a new socket joins a particular socket.io 'room'
				// allowing 'trickle' to be true will make establishing data connections faster, but
				// I will work on that later...
				socket.on('newJoin', (socketid, peername) => {
					let newPeer = new peer(
						msRef.current ? { initiator: true, trickle: false, stream: msRef.current } : { initiator: true, trickle: false },
					);
					// adding potential peerConnection to the buffer
					let DataConn: DataConnection = {
						name: peername,
						dataConnection: newPeer,
					};
					peerConnectionBuffer.current.push(DataConn);

					newPeer.on('error', err => {
						console.error(err);
					});

					// generating a data offer to send to signaling server which then sends it to the joining user.
					newPeer.on('signal', dataOffer => {
						socket.emit('dataOffer', dataOffer, socketid);
					});

					newPeer.on('close', () => {
						console.log('closing', peername);
						if (socketRef.current) {
							setPeerDataConnections((_: Array<DataConnection>) => {
								let filtered = _.filter((pdc: DataConnection) => pdc.name !== peername);
								peerDataConnectionsRef.current = filtered;
								return filtered;
							});
						}
					});
					newPeer.on('data', (data) => {
						let msg = data.toString('utf8');
						console.log('msg', msg);
						if (msg === 'change') {
							setNonHostMicState((prev) => !prev);
						} else if (msg === 'closeStream') {
							setPeerMediaInfo((prevMediaInfo: Array<PeerMediaStream>) =>
								prevMediaInfo.filter((pmi: PeerMediaStream) => pmi.name !== peername)
							);
						}
					});
					newPeer.on('stream', (stream: MediaStream) => {
						let newMediaInfo: PeerMediaStream = {
							name: peername,
							mediaStream: stream,
						};
						setPeerMediaInfo((prevMediaInfo: Array<PeerMediaStream>) => [...prevMediaInfo, newMediaInfo]);
					});
					newPeer.on('connect', () => {
						console.log('connected0');
						setPeerDataConnections((_: Array<DataConnection>) => {
							let n: DataConnection = peerConnectionBuffer.current.find(
								(peerConnection: DataConnection) => peerConnection.name === peername,
							);
							if (n !== undefined) {
								let nArr = [..._, n];
								peerDataConnectionsRef.current = nArr;
								return nArr;
							}
							return _;
						});
					});
				});

				// data answer required for p2p connection.
				socket.on('dataAnswer', (dataAnswer, peername) => {
					peerConnectionBuffer.current.forEach((peerConnection: DataConnection) => {
						if (peerConnection.name === peername) {
							peerConnection.dataConnection.signal(dataAnswer);
						}
					});
				});

				// this is the data offer required for establishing a p2p connection.
				socket.on('dataOffer', (dataOffer, socketid, peername) => {
					if (!peerDataConnectionsRef.current.some((pdc: DataConnection) => pdc.name === peername)) {
						let newPeer = new peer(msRef.current ? { trickle: false, stream: msRef.current } : { trickle: false });
						// adding potential peerConnection to the buffer
						let DataConn: DataConnection = {
							name: peername,
							dataConnection: newPeer,
						};
						peerConnectionBuffer.current.push(DataConn);

						newPeer.on('signal', dataAnswer => {
							socket.emit('dataAnswer', dataAnswer, socketid);
						});

						newPeer.signal(dataOffer);

						newPeer.on('error', err => {
							console.error(err);
						});

						newPeer.on('data', (data) => {
							let msg = data.toString('utf8');
							console.log('msg', msg);
							if (msg === 'change') {
								setNonHostMicState((prev) => !prev);
							} else if (msg === 'closeStream') {
								setPeerMediaInfo((prevMediaInfo: Array<PeerMediaStream>) =>
									prevMediaInfo.filter((pmi: PeerMediaStream) => pmi.name !== peername)
								);
							}
						});

						newPeer.on('close', () => {
							console.log('closing', peername);
							if (socketRef.current) {
								setPeerDataConnections((_: Array<DataConnection>) => {
									let filtered = _.filter((pdc: DataConnection) => pdc.name !== peername);
									peerDataConnectionsRef.current = filtered;
									return filtered;
								});
							}
						});

						newPeer.on('stream', (stream: MediaStream) => {
							let newMediaInfo: PeerMediaStream = {
								name: peername,
								mediaStream: stream,
							};
							setPeerMediaInfo((prevMediaInfo: Array<PeerMediaStream>) => [...prevMediaInfo, newMediaInfo]);
						});

						newPeer.on('connect', () => {
							console.log('connected');
							setPeerDataConnections((_: Array<DataConnection>) => {
								let res: DataConnection = peerConnectionBuffer.current.find(
									(peerConnection: DataConnection) => peerConnection.name === peername,
								);
								// console.log('n', n, n !== undefined);
								if (res !== undefined) {
									let n = (Object.fromEntries(Object.entries(res)) as DataConnection);
									// this line right here causes our setState call to not update the state...weird
									// MIGHT BE REACT BUG.
									// When we have this uncommented, and we call setPeerMediaInfo, this state update never goes through.
									// changing this ref at all will cause the state change to never go through IDK why.
									// peerConnectionBuffer.current = peerConnectionBuffer.current.filter(
									// 	(peerConnection: DataConnection) => peerConnection.name !== peername,
									// );
									let nArr = [..._, n];
									peerDataConnectionsRef.current = nArr;
									return nArr;
								}
								console.log('res is undefined', res);
								return _;
							});
						});
					} else {
						let peer = peerDataConnectionsRef.current.find((pdc: DataConnection) => pdc.name === peername);
						peer.dataConnection.signal(dataOffer);
					}
				});

				if (username === HostUsername) {
					setisHost(true);
				}
				setLoaded(true);
			})();
		}
	}, [HostUsername, username]);

	useEffect(() => {
		setSpeakers(peerDataConnections.filter(
			(pdc: DataConnection) =>
				peerMediaInfo.some(
					(pmi: PeerMediaStream) => pmi.name === pdc.name,
				),
		));
		setListeners(peerDataConnections.filter(
			(pdc: DataConnection) =>
				!peerMediaInfo.some(
					(pmi: PeerMediaStream) => pmi.name === pdc.name,
				),
		));
	}, [peerDataConnections, peerMediaInfo]);

	useEffect(() => {
		if (isHost) {
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then(ms => {
					msRef.current = ms;
					peerDataConnectionsRef.current.forEach(
						(pdc: DataConnection) => pdc.dataConnection.addStream(ms),
					);
				});
		}
	}, [isHost]);

	useEffect(() => {
		if (nonHostMicState) {
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then(ms => {
					msRef.current = ms;
					peerDataConnectionsRef.current.forEach(
						(pdc: DataConnection) => pdc.dataConnection.addStream(ms),
					);
					setisSpeaker(true);
				});
		} else {
			if (msRef.current) {
				peerDataConnectionsRef.current.forEach(
					(pdc: DataConnection) => pdc.dataConnection.removeStream(msRef.current),
				);
				peerDataConnectionsRef.current.forEach(
					(pdc: DataConnection) => pdc.dataConnection.send('closeStream'),
				);
			}
			setisSpeaker(false);
			msRef.current = null;
		}
	}, [nonHostMicState]);

	return Loaded && glbl.authenticated
		? (
			<div className='h-full w-full flex flex-col items-center dark:bg-slate-600'>
				<div className='h-full w-5/6 md:w-1/2 border-b border-black'>
					<h1 className='text-2xl font-bold text-center dark:text-white'>speakers</h1>
					<input
						className='w-full outline-none p-2 ring ring-black rounded m-1'
						type='search'
						onChange={(e) => setUserSearch(e.target.value)}
						placeholder='filter users'
						value={userSearch}
					/>
					<div className='overflow-y-auto w-full flex flex-wrap'>
						{isHost || isSpeaker
							? <Roomer key={username} name={username} isHost={isHost} Speaker={false} peer={null} username={username} />
							: null}
						{speakers.map((pdc: DataConnection) => (
							<Roomer
								key={pdc.name}
								name={pdc.name}
								isHost={isHost}
								Speaker={true}
								peer={pdc.dataConnection}
								username={username}
								mediaStream={peerMediaInfo.find((pmi: PeerMediaStream) => pmi.name === pdc.name)?.mediaStream}
							/>
						))}
					</div>
				</div>
				<div className='h-full w-5/6 md:w-1/2'>
					<h2 className='text-xl font-bold text-center dark:text-white'>listeners</h2>
					<div className='overflow-y-auto w-full flex flex-wrap'>
						{!isHost && !isSpeaker
							? <Roomer key={username} name={username} isHost={isHost} Speaker={false} peer={null} username={username} />
							: null}
						{listeners.map((pdc: DataConnection) => (
							<Roomer
								key={pdc.name}
								name={pdc.name}
								isHost={isHost}
								Speaker={false}
								peer={pdc.dataConnection}
								username={username}
							/>
						))}
					</div>
				</div>
				<div className='fixed bottom-0 w-full flex justify-center'>
					<Link href='/home'>
						<a className='bg-black text-white shadow shadow-black p-2 rounded m-1'>
							leave
						</a>
					</Link>
					{isHost || micState
						? (
							<button
								onClick={() => {
									msRef.current.getTracks().forEach((track: MediaStreamTrack) => track.enabled = !muteState ? false : true);
									setMuteState((prevState) => !prevState);
								}}
								className='bg-black p-2 text-white rounded m-1 shadow shadow-black'
							>
								{muteState ? 'unmute' : 'mute'} mic
							</button>
						)
						: null}
					{/* <button onClick={() => console.log(peerDataConnections)} className='bg-red-700 m-1'>dataConns</button>
					<button onClick={() => console.log(peerMediaInfo)} className='bg-red-700 m-1'>mediaInfo</button> */}
				</div>
			</div>
		)
		: (
			<div className='h-full w-full flex justify-center items-center text-2xl font-medium dark:bg-slate-600 dark:text-white'>
				Loading...
			</div>
		);
}
