import { truncate } from 'fs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import { GLOBALS } from '../contexts/globals';

// NOTE 1/21/2022 - I swapped to simple-peer. PeerJS is pretty much dead.

interface DataConnection {
	name: string;
	dataConnection: any;
	mediaStream: any;
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
							peer.send(Speaker ? '0' : '1');
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
	let [speakers, setSpeakers]: [Array<DataConnection>, any] = useState([]);
	let [listeners, setListeners]: [Array<DataConnection>, any] = useState([]);
	let [userSearch, setUserSearch]: [string, any] = useState('');
	let [muteState, setMuteState] = useState(false);
	let [micState, setMicState] = useState(false);
	let msRef: MutableRefObject<MediaStream> = useRef(null);
	let peerRef = useRef(null);
	let socketRef = useRef(null);
	let peerDataConnectionsRef = useRef(peerDataConnections);

	// effect is for cleaning up
	useEffect(() => {
		// cleans up after the component unmounts
		return () => {
			msRef.current
				?.getTracks()
				.forEach((track: MediaStreamTrack) => track.stop());
			socketRef.current?.disconnect();
		};
	}, []);

	useEffect(() => {
		if (glbl.authenticated) {
			glbl.setInRoom(true);
		}
	}, [glbl.authenticated]);

	// this effect is for seeing if a user is the host
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
						msRef.current
							? { initiator: true, trickle: false, stream: msRef.current }
							: { initiator: true, trickle: false },
					);
					newPeer.on('signal', data => {
						socket.emit('data', data, socketid);
					});
					newPeer.on('data', data => {
						if (data === '0') {
							setMicState(false);
						} else if (data === '1') {
							setMicState(true);
						} else if (data === 'closeStream') {
							setPeerDataConnections((prevDataConns: Array<DataConnection>) => [...prevDataConns]);
						}
					});
					newPeer.on('stream', stream => {
						// we do this just in case the peerDataConnections isn't updated in time. React might decide to not update that
						// array right away.
						setPeerDataConnections((prevDataConns: Array<DataConnection>) => {
							let fResult = prevDataConns.find((pdc: DataConnection) => pdc.name === peername);
							if (fResult === undefined) {
								let newDataConn: DataConnection = {
									name: peername,
									dataConnection: newPeer,
									mediaStream: stream,
								};
								let newDataConns: Array<DataConnection> = [...prevDataConns, newDataConn];
								peerDataConnectionsRef.current = newDataConns;
								return newDataConns;
							} else {
								let newDataConns: Array<DataConnection> = [...prevDataConns];
								let fIndex = prevDataConns.findIndex((pdc: DataConnection) => pdc.name === peername);
								newDataConns[fIndex].mediaStream = stream;
								peerDataConnectionsRef.current = newDataConns;
								return newDataConns;
							}
						});
					});
					let DataConnObject: DataConnection = {
						name: peername,
						dataConnection: newPeer,
						mediaStream: null,
					};
					newPeer.on('connect', () => {
						setPeerDataConnections((prevDataConns: Array<DataConnection>) => {
							let newDataConns: Array<DataConnection> = [...prevDataConns, DataConnObject];
							peerDataConnectionsRef.current = newDataConns;
							return newDataConns;
						});
					});
				});

				// this is the data required for establishing a p2p connection.
				socket.on('dataConnect', (data, peername) => {
					let newPeer = new peer(msRef.current ? { trickle: false, stream: msRef.current } : { trickle: false });
					newPeer.signal(data);
					newPeer.on('data', (data) => {
						if (data === '0') {
							setMicState(false);
						} else if (data === '1') {
							setMicState(true);
						} else if (data === 'closeStream') {
							setPeerDataConnections((prevDataConns: Array<DataConnection>) => [...prevDataConns]);
						}
					});
					newPeer.on('stream', stream => {
						// we do this just in case the peerDataConnections isn't updated in time. React might decide to not update that
						// array right away.
						setPeerDataConnections((prevDataConns: Array<DataConnection>) => {
							let fResult = prevDataConns.find((pdc: DataConnection) => pdc.name === peername);
							if (fResult === undefined) {
								let newDataConn: DataConnection = {
									name: peername,
									dataConnection: newPeer,
									mediaStream: stream,
								};
								let newDataConns: Array<DataConnection> = [...prevDataConns, newDataConn];
								peerDataConnectionsRef.current = newDataConns;
								return newDataConns;
							} else {
								let newDataConns: Array<DataConnection> = [...prevDataConns];
								let fIndex = prevDataConns.findIndex((pdc: DataConnection) => pdc.name === peername);
								newDataConns[fIndex].mediaStream = stream;
								peerDataConnectionsRef.current = newDataConns;
								return newDataConns;
							}
						});
					});
					let DataConnObject: DataConnection = {
						name: peername,
						dataConnection: newPeer,
						mediaStream: null,
					};
					newPeer.on('connect', () => {
						setPeerDataConnections((prevDataConns: Array<DataConnection>) => {
							let newDataConns: Array<DataConnection> = [...prevDataConns, DataConnObject];
							peerDataConnectionsRef.current = newDataConns;
							return newDataConns;
						});
					});
				});
				if (username === HostUsername) {
					setisHost(true);
				}
				setLoaded(true);
			})();
		}
	}, [HostUsername, username]);

	// whenever the peerDataConnections array updates, this effect runs to split the connections up between who can talk ( has a mediaStream ) and 
	// those that cannot
	useEffect(() => {
		setSpeakers(peerDataConnections.filter((pdc: DataConnection) => pdc.mediaStream !== null));
		setListeners(peerDataConnections.filter((pdc: DataConnection) => pdc.mediaStream === null));
	}, [peerDataConnections]);

	// if the user is a host or if the host has allowed a user to talk, we set their mic.
	useEffect(() => {
		if (isHost || micState) {
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then((micMediaStream) => {
					msRef.current = micMediaStream;
					peerDataConnectionsRef.current.forEach((pdc: DataConnection) => pdc.dataConnection.addStream(msRef.current));
				});
		} else {
			if (msRef.current !== null) {
				peerDataConnectionsRef.current.forEach((pdc: DataConnection) => pdc.dataConnection.removeStream(msRef.current));
				peerDataConnectionsRef.current.forEach((pdc: DataConnection) => pdc.dataConnection.send('closeStream'));
			}
			msRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
			msRef.current = null;
		}
	}, [isHost, micState]);

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
								mediaStream={pdc.mediaStream}
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
								mediaStream={pdc.mediaStream}
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
					{isHost && msRef.current !== null
						? (
							<button
								onClick={() => {
									msRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.enabled = !muteState);
									setMuteState((prevState) => !prevState);
								}}
								className='bg-black p-2 text-white rounded m-1 shadow shadow-black'
							>
								{muteState ? 'unmute' : 'mute'} mic
							</button>
						)
						: null}
					<button onClick={() => console.log(peerDataConnectionsRef.current)} className='bg-red-700 m-1'>dataConns</button>
				</div>
			</div>
		)
		: (
			<div className='h-full w-full flex justify-center items-center text-2xl font-medium dark:bg-slate-600 dark:text-white'>
				Loading...
			</div>
		);
}
