import { EmojiLookBottom, EmojiLookTop } from 'iconoir-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { GLOBALS } from '../contexts/globals';

// the function that gets returned from a useEffect function is that function
// that cleans up the PREVIOUS effect

interface DataChannelDataType {
	type: string;
	name?: string;
}

interface PeerDataConnection {
	name: string;
	dataConnection: any;
}

interface PeerMediaConnection {
	name: string;
	mediaStream: MediaStream;
	mediaConnection: any;
}

let Roomer = ({ name, RoomTalker, mediaStream = null }) => {
	let AudioRef = useRef(null);
	useEffect(() => {
		AudioRef.current.srcObject = mediaStream;
	}, [mediaStream]);
	return (
		<div className='flex flex-col items-center w-48'>
			{RoomTalker ? <EmojiLookBottom width={25} height={25} /> : <EmojiLookTop width={25} height={25} />}
			<h3>{name}</h3>
			<div className='w-full'>
				<audio ref={AudioRef} autoPlay={true} />
			</div>
		</div>
	);
};

let useConnect = (myPeerID: string) => {
	let router = useRouter();
	let [peerIDs, setPeerIDs] = useState([]);
	let [username, setUsername] = useState('');
	let [HostUsername, setHostUsername] = useState('');
	useEffect(() => {
		if (myPeerID.length > 0) {
			let { room } = router.query;
			fetch('/api/joinroom', {
				method: 'POST',
				body: JSON.stringify({
					roomid: room,
					peerid: myPeerID,
				}),
			}).then(async (res) => {
				if (res.ok) {
					let { peerIDsDB, usernameDB, HostUsernameDB } = await res.json();
					setPeerIDs(peerIDsDB);
					setUsername(usernameDB);
					setHostUsername(HostUsernameDB);
				} else {
					router.push('/home');
				}
			});
		}
	}, [myPeerID]);
	return { peerIDs: peerIDs, username: username, HostUsername: HostUsername };
};

export default function Room() {
	let glbl = useContext(GLOBALS);
	let [myPeerID, setMyPeerID] = useState('');
	let [isHost, setIsHost] = useState(false);
	let { peerIDs, username, HostUsername } = useConnect(myPeerID);
	let [Loaded, setLoaded] = useState(false);
	let [_MEDIA_STREAM_, setMediaStream]: [MediaStream, any] = useState(null);
	let [micState, setMicState] = useState(null);
	let [peerDataConnections, setPeerDataConnections]: [
		Array<PeerDataConnection>,
		any,
	] = useState([]);
	let [peerMediaConnections, setPeerMediaConnections]: [
		Array<PeerMediaConnection>,
		any,
	] = useState([]);
	let msRef = useRef(_MEDIA_STREAM_);
	let peerRef = useRef(glbl.Peer);
	let peerDataConnectionsRef = useRef(peerDataConnections);
	// these might close by themselves
	let peerMediaConnectionsRef = useRef(peerMediaConnections);

	useEffect(() => {
		// cleans up after the component unmounts
		return () => {
			msRef.current
				?.getTracks()
				.forEach((track: MediaStreamTrack) => track.stop());
			peerDataConnectionsRef.current.forEach((connection: PeerDataConnection) => connection.dataConnection.close());
			peerMediaConnectionsRef.current.forEach(
				(connection: PeerMediaConnection) => connection.mediaConnection.close(),
			);
			peerRef.current.destroy();
			glbl.setPeer(null);
		};
	}, []);

	useEffect(() => {
		if (glbl.Peer === null) {
			(async () => {
				let P = new (await import('peerjs')).default();
				glbl.setPeer(P);
				peerRef.current = P;
				P.on('open', (id) => {
					setLoaded(true);
					setMyPeerID(id);
				});
			})();
		} else {
			setLoaded(true);
		}
	}, [glbl.Peer]);

	useEffect(() => {
		if (
			username.length > 0
			&& peerIDs.length > 0
			&& HostUsername.length > 0
			&& myPeerID.length > 0
		) {
			if (username === HostUsername) {
				setIsHost(true);
			}

			peerIDs.forEach((peerID) => {
				if (peerID !== myPeerID) {
					let conn = glbl.Peer.connect(peerID);
					if (conn === undefined) {
						return;
					}
					conn.on('open', () => {
						conn.on('data', (data: DataChannelDataType) => {
							switch (data.type) {
								case 'name':
									{
										setPeerDataConnections(
											(prevPeerDataConnections: Array<PeerDataConnection>) => {
												let newPeerDataConnections = [
													...prevPeerDataConnections,
												];
												newPeerDataConnections.forEach(
													(pdc: PeerDataConnection) => {
														if (pdc.dataConnection.peer === conn.peer) {
															pdc.name = data.name;
														}
													},
												);
												peerDataConnectionsRef.current = newPeerDataConnections;
												return newPeerDataConnections;
											},
										);
									}
									break;
								default:
									break;
							}
						});
						setPeerDataConnections(
							(prevPeerDataConnections: Array<PeerDataConnection>) => {
								if (
									prevPeerDataConnections.some(
										(pdc: PeerDataConnection) => pdc.dataConnection.peer === conn.peer,
									)
								) {
									return prevPeerDataConnections;
								}
								let newPeerDataConnections = [
									...prevPeerDataConnections,
									{
										name: null,
										dataConnection: conn,
									},
								];
								peerDataConnectionsRef.current = newPeerDataConnections;
								return newPeerDataConnections;
							},
						);
						conn.send({ type: 'name', name: username });
					});
					conn.on('error', (e) => {});
					conn.on('close', () => {
						setPeerDataConnections(
							(prevPeerDataConnections: Array<PeerDataConnection>) => {
								return prevPeerDataConnections.filter(
									(pdc: PeerDataConnection) => pdc.dataConnection.peer !== conn.peer,
								);
							},
						);
					});
				}
			});
		}
	}, [peerIDs, HostUsername, username, myPeerID]);

	useEffect(() => {
		if (username.length > 0 && HostUsername.length > 0 && myPeerID.length > 0) {
			// for peers that are not the host
			glbl.Peer.on('call', (call) => {
				call.on('error', (e) => {
					console.error('ERROR', e);
				});
				call.answer();
				console.log('somebody called me');
				call.on('stream', (remoteStream: MediaStream) => {
					setPeerMediaConnections(
						(prevPeerMediaConnections: Array<PeerMediaConnection>) => {
							if (
								prevPeerMediaConnections.some(
									(pmc: PeerMediaConnection) => pmc.mediaConnection.peer === call.peer,
								)
							) {
								return prevPeerMediaConnections;
							}
							let newMediaConnection = {
								name: null,
								mediaStream: remoteStream,
								mediaConnection: call,
							};
							setPeerDataConnections(
								(prevPeerDataConnections: Array<PeerDataConnection>) => {
									prevPeerDataConnections.forEach((pdc: PeerDataConnection) => {
										if (pdc.dataConnection.peer === call.peer) {
											newMediaConnection.name = pdc.name;
										}
									});
									return prevPeerDataConnections;
								},
							);
							let newPeerConnections = [
								...prevPeerMediaConnections,
								newMediaConnection,
							];
							peerMediaConnectionsRef.current = newPeerConnections;
							return newPeerConnections;
						},
					);
					console.log('open?', call.open);
				});
				call.on('close', () => {
					setPeerMediaConnections(
						(prevPeerMediaConnections: Array<PeerMediaConnection>) => {
							return prevPeerMediaConnections.filter(
								(pmc: PeerMediaConnection) => pmc.mediaConnection.peer !== call.peer,
							);
						},
					);
				});
			});

			glbl.Peer.on('connection', (conn) => {
				conn.on('open', () => {
					conn.on('data', (data: DataChannelDataType) => {
						switch (data.type) {
							case 'name':
								{
									setPeerDataConnections(
										(prevPeerDataConnections: Array<PeerDataConnection>) => {
											let newPeerDataConnections = [...prevPeerDataConnections];
											newPeerDataConnections.forEach(
												(pdc: PeerDataConnection) => {
													if (pdc.dataConnection.peer === conn.peer) {
														pdc.name = data.name;
													}
												},
											);
											peerDataConnectionsRef.current = newPeerDataConnections;
											return newPeerDataConnections;
										},
									);
								}
								break;
							default:
								break;
						}
					});
					setPeerDataConnections(
						(prevPeerDataConnections: Array<PeerDataConnection>) => {
							if (
								prevPeerDataConnections.some(
									(dc: PeerDataConnection) => dc.dataConnection.peer === conn.peer,
								)
							) {
								return prevPeerDataConnections;
							}
							let newPeerChannels = [
								...prevPeerDataConnections,
								{ name: null, dataConnection: conn },
							];
							peerDataConnectionsRef.current = newPeerChannels;
							return newPeerChannels;
						},
					);
					conn.send({ type: 'name', name: username });
				});
				conn.on('error', (e) => {});
				conn.on('close', () => {
					setPeerDataConnections(
						(prevPeerDataConnections: Array<PeerDataConnection>) => {
							return prevPeerDataConnections.filter(
								(pdc: PeerDataConnection) => pdc.dataConnection.peer !== conn.peer,
							);
						},
					);
				});
			});
		}
	}, [username, HostUsername, myPeerID]);

	useEffect(() => {
		if (glbl.authenticated) {
			glbl.setInRoom(true);
		}
	}, [glbl.authenticated]);

	useEffect(() => {
		if (isHost) {
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then((micMediaStream) => {
					setMediaStream(micMediaStream);
				});
		}
	}, [isHost]);

	useEffect(() => {
		if (
			peerDataConnections.length > 0
			&& peerIDs.length > 0
			&& _MEDIA_STREAM_ !== null
			&& myPeerID.length > 0
			&& username.length > 0
		) {
			msRef.current = _MEDIA_STREAM_;
			[
				...peerIDs,
				...peerDataConnections.map(
					(pdc: PeerDataConnection) => pdc.dataConnection.peer,
				),
			].forEach((peerid) => {
				if (peerid !== myPeerID && glbl.Peer !== null) {
					let call = glbl.Peer.call(peerid, _MEDIA_STREAM_);
					if (call === undefined) {
						return;
					}
					call.on('stream', (remoteStream: MediaStream) => {
						setPeerMediaConnections(
							(prevPeerMediaConnections: Array<PeerMediaConnection>) => {
								if (
									prevPeerMediaConnections.some(
										(pmc: PeerMediaConnection) => pmc.mediaConnection.peer === peerid,
									)
								) {
									return prevPeerMediaConnections;
								}
								let newMediaConnection: PeerMediaConnection = {
									name: null,
									mediaStream: remoteStream,
									mediaConnection: call,
								};
								peerDataConnections.forEach((pdc: PeerDataConnection) => {
									if (pdc.dataConnection.peer === peerid) {
										newMediaConnection.name = pdc.name;
									}
								});
								let newPeerMediaConnections = [
									...prevPeerMediaConnections,
									newMediaConnection,
								];
								peerMediaConnectionsRef.current = newPeerMediaConnections;
								return newPeerMediaConnections;
							},
						);
					});
					call.on('close', () => {
						setPeerMediaConnections(
							(prevPeerMediaConnections: Array<PeerMediaConnection>) => {
								return prevPeerMediaConnections.filter(
									(pmc: PeerMediaConnection) => pmc.mediaConnection.peer !== call.peer,
								);
							},
						);
					});
				}
			});
		}
	}, [
		_MEDIA_STREAM_,
		myPeerID,
		peerIDs,
		username,
		peerDataConnections,
		glbl.Peer,
	]);

	return Loaded && glbl.authenticated
		? (
			<div className='h-full w-full flex flex-col items-center'>
				<div className='h-full w-5/6 md:w-1/2 border-b border-black'>
					<h1 className='text-2xl font-bold text-center'>speakers</h1>
					<div className='overflow-y-auto w-full grid grid-cols-5'>
						{isHost && myPeerID.length > 0 && HostUsername.length > 0 ? <Roomer name={username} RoomTalker={true} /> : null}
						{peerMediaConnections.map((pmc: PeerMediaConnection) =>
							pmc.mediaConnection.open
								? (
									<Roomer
										key={pmc.name}
										name={pmc.name}
										mediaStream={pmc.mediaStream}
										RoomTalker={true}
									/>
								)
								: null
						)}
					</div>
				</div>
				<div className='h-full w-5/6 md:w-1/2'>
					<h2 className='text-xl font-bold text-center'>listeners</h2>
					<div className='overflow-y-auto w-full grid grid-cols-5'>
						{!isHost && myPeerID.length > 0 && HostUsername.length > 0 ? <Roomer name={username} RoomTalker={false} /> : null}
						{peerDataConnections.map((pdc: PeerDataConnection) =>
							pdc.dataConnection.open
								&& !peerMediaConnections.some(
									(pmc: PeerMediaConnection) => pmc.name === pdc.name,
								)
								? <Roomer key={pdc.name} name={pdc.name} RoomTalker={false} />
								: null
						)}
					</div>
				</div>
				<Link href='/home'>
					<a className='bg-black text-white shadow shadow-black p-2 rounded'>
						leave
					</a>
				</Link>
				<button className='bg-red-400' onClick={() => console.log(glbl.Peer.id)}>
					show id
				</button>
				<button
					className='bg-red-400'
					onClick={() => console.log(peerDataConnections, peerDataConnections.length)}
				>
					show data connections
				</button>
				<button className='bg-red-400' onClick={() => console.log(isHost)}>
					isHost
				</button>
				<button
					className='bg-red-400'
					onClick={() => console.log(peerMediaConnections)}
				>
					mediaConnections
				</button>
			</div>
		)
		: (
			'Loading...'
		);
}
