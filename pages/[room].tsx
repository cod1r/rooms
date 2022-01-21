import Link from 'next/link';
import { useRouter } from 'next/router';
import { DataConnection, MediaConnection } from 'peerjs';
import { useContext, useEffect, useRef, useState } from 'react';
import { GLOBALS } from '../contexts/globals';

// the function that gets returned from a useEffect function is that function
// that cleans up the PREVIOUS effect

// IMPORTANT NOTES
// We use data connections for everything
// which means that data connections represent the connections that should be connected
// If a mediaConnection's peerid isn't in the dataconnections array, then we should disconnect it.

// If we establish a mediaConnection that is one-sided, I don't think calling close on it does anything.
// (the event is triggered for the user that is listening)
// In other words, the event 'close' won't be called on one of the ends (speaker end). Our fix is to see what mediaConnections are not
// present as a dataConnection.

// Host Controls
// Mute people, Move people on/off stage, end the room, maybe ban people?
// For moving people on/off stage, we can just generalize those commands as muting and unmuting people as a host

// for some reason, if I change a state object and return a copy of that exact same object, I get duplicates
// my guess is that React, combines changes.
// After checking, my guess is right. React merges state changes.

// How I separate speakers and listeners
// The way I separate speakers from listeners is by peerjs not keeping/storing a mediaConnection for one-sided calls for speakers,
// because the call.on('stream') event is never triggered because the person picking up never provides a stream (hence, one-sided)

// How our room works
// There are speakers and listeners.
// One host gets to decide who gets to talk and who doesn't.
// Speakers and listeners store dataConnections for everyone.
// Only listeners store one-sided mediaConnections.
// Speakers have to store every mediaConnection they have that isn't one-sided.
// When the host moves a listener to a speaker position, the listener needs to call everyone in the room (speakers and listeners).
// -- I don't want duplicate mediaConnections for the same callee, so I make the listener-to-speaker close every mediaConnection before calling everybody.
// -- All of the speakers that are getting called by the listener-to-speaker shouldn't have duplicate mediaConnections (or already existing mediaConnections) for the
// -- listener-to-speaker user. All of the listeners shouldn't either because they only have mediaConnections stored for the speakers.
// When the host moves a speaker to a listender position, I also close every mediaConnection, which makes every speaker recall the speaker-to-listener. Assuming
// -- that the speaker's close event triggers. But it doesn't for some reason (I think this is a peerjs problem). So my fix is to send a message in the data Channel to
// -- close the media connections.

interface DataChannelDataType {
	type: string;
	name?: string;
}

interface PeerDataConnection {
	name: string;
	dataConnection: DataConnection;
}

interface PeerMediaConnection {
	name: string;
	mediaStream: MediaStream;
	mediaConnection: MediaConnection;
}

interface Message {
	type: string;
	user: string;
}

let Roomer = ({ name, RoomTalker, isHost, setMessage, username, mediaStream = null }) => {
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
							// this sets the message so that the host sends it to the appropriate user so they change their mediaStream (micStateForNonHost)
							setMessage({ type: 'change', user: name });
						}}
					>
						{RoomTalker ? 'no talk' : 'allow talk'}
					</button>
				)
				: null}
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
	let [micStateForNonHost, setMicState] = useState(false);
	let [peerDataConnections, setPeerDataConnections]: [
		Array<PeerDataConnection>,
		any,
	] = useState([]);
	let [peerMediaConnections, setPeerMediaConnections]: [
		Array<PeerMediaConnection>,
		any,
	] = useState([]);
	let [message, setMessage]: [Message, any] = useState(null);
	let [userSearch, setUserSearch]: [string, any] = useState('');
	let [muteState, setMuteState] = useState(false);
	let msRef = useRef(_MEDIA_STREAM_);
	let peerRef = useRef(glbl.Peer);
	let peerDataConnectionsRef = useRef(peerDataConnections);
	let peerMediaConnectionsRef = useRef(peerMediaConnections);

	// effect is for cleaning up...
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
		if (myPeerID.length > 0 && username.length > 0 && HostUsername.length > 0 && peerIDs.length > 0) {
			setLoaded(true);
		}
	}, [myPeerID, username, HostUsername, peerIDs]);

	// when somebody joins a room, they need to initialize a peer object
	useEffect(() => {
		if (glbl.Peer === null) {
			(async () => {
				let P = new (await import('peerjs')).default({
					debug: 1,
				});
				glbl.setPeer(P);
				peerRef.current = P;
				P.on('open', (id) => {
					setMyPeerID(id);
				});
			})();
		}
	}, [glbl.Peer]);

	// this effect is for users that join a room so that they establish the essential data connections that are required for our room thing to work
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
				if (peerID !== myPeerID && glbl.Peer !== null) {
					let conn: DataConnection = glbl.Peer.connect(peerID);
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
												if (
													prevPeerDataConnections.some(
														(pdc: PeerDataConnection) => pdc.dataConnection.peer === conn.peer || pdc.name === data.name,
													)
												) {
													return prevPeerDataConnections;
												}
												let newPeerDataConnections = [
													...prevPeerDataConnections,
													{
														name: data.name,
														dataConnection: conn,
													},
												];
												peerDataConnectionsRef.current = newPeerDataConnections;
												return newPeerDataConnections;
											},
										);
									}
									break;
								case 'change':
									{
										setMicState((prevState) => !prevState);
									}
									break;
								case 'close':
									// this case should only be for closing mediaConnections
									{
										peerMediaConnectionsRef.current.forEach((pmc: PeerMediaConnection) => {
											if (pmc.mediaConnection.peer === conn.peer) {
												pmc.mediaConnection.close();
											}
										});
									}
									break;
								default:
									break;
							}
						});
						conn.send({ type: 'name', name: username });
					});
					conn.on('error', (e) => {
						console.error('conn error', e);
					});
					conn.on('close', () => {
						setPeerDataConnections(
							(prevPeerDataConnections: Array<PeerDataConnection>) => {
								let filtered = prevPeerDataConnections.filter(
									(pdc: PeerDataConnection) => pdc.dataConnection.peer !== conn.peer,
								);
								// we should close the mediaConnection if the corresponding dataConnection for the peer closes.
								setPeerMediaConnections((prevPeerMediaConnections: Array<PeerMediaConnection>) => {
									prevPeerMediaConnections.forEach((pmc: PeerMediaConnection) => {
										if (pmc.mediaConnection.peer === conn.peer && pmc.mediaConnection.open) {
											pmc.mediaConnection.close();
										}
									});
									let filtered_media = prevPeerMediaConnections.filter(
										(pmc: PeerMediaConnection) =>
											filtered.some(
												(pdc: PeerDataConnection) => pdc.dataConnection.peer === pmc.mediaConnection.peer,
											),
									);
									peerMediaConnectionsRef.current = filtered_media;
									return filtered_media;
								});
								peerDataConnectionsRef.current = filtered;
								return filtered;
							},
						);
					});
				}
			});
		}
	}, [peerIDs, HostUsername, username, myPeerID, glbl.Peer]);

	// this effect is just to set the 'reaction' events for everyone. if they get called, they pick up the call, etc. same thing for data connections
	useEffect(() => {
		if (username.length > 0 && HostUsername.length > 0 && myPeerID.length > 0 && glbl.Peer !== null) {
			glbl.Peer.on('call', (call: MediaConnection) => {
				call.on('error', (e) => {
					console.error('call ERROR', e);
				});
				// will there ever be a case where the wrong condition route gets evaluated?
				// The only time msRef changes is when the host joins a room or a user is given permission to talk by the host.
				// the only time this 'call' event gets triggered is when a user is given permission to talk by the host.
				// will this 'call' event trigger at the same time as msRef changes? I am guessing no because whenever someone's mediaStream
				// changes, they will be the one calling. Not getting called.
				if (msRef.current !== null) {
					call.answer(msRef.current);
				} else {
					call.answer();
				}
				console.log('somebody called me');
				call.on('stream', (remoteStream: MediaStream) => {
					setPeerMediaConnections(
						(prevPeerMediaConnections: Array<PeerMediaConnection>) => {
							let newPeerMediaConnections = [...prevPeerMediaConnections];
							let newMediaConnection: PeerMediaConnection = {
								name: null,
								mediaStream: remoteStream,
								mediaConnection: call,
							};
							peerDataConnectionsRef.current.forEach((pdc: PeerDataConnection) => {
								if (pdc.dataConnection.peer === call.peer) {
									newMediaConnection.name = pdc.name;
								}
							});
							newPeerMediaConnections.push(newMediaConnection);
							peerMediaConnectionsRef.current = newPeerMediaConnections;
							return newPeerMediaConnections;
						},
					);
					console.log('open?', call.open);
				});
				call.on('close', () => {
					console.log('call closed0', call.peer);
					// this part is for when a nonhost who WAS allowed to talk, is turned into a listener
					// This part recalls them (on the speakers side), so that they can still hear all the speakers.
					// This gets triggered when the person turning into a listener, closes all of their mediaConnections
					// NOTE that this SHOULD be a one-sided call which is why it isn't added to the peerMediaConnections array.
					if (msRef.current !== null) {
						let recall = glbl.Peer.call(call.peer, msRef.current);
						setPeerMediaConnections((prevPeerMediaConnections: Array<PeerMediaConnection>) => {
							return prevPeerMediaConnections.filter((pmc: PeerMediaConnection) => pmc.mediaConnection.peer !== recall.peer);
						});
					}
				});
			});

			glbl.Peer.on('connection', (conn: DataConnection) => {
				conn.on('open', () => {
					conn.on('data', (data: DataChannelDataType) => {
						switch (data.type) {
							case 'name':
								{
									setPeerDataConnections(
										(prevPeerDataConnections: Array<PeerDataConnection>) => {
											if (
												prevPeerDataConnections.some(
													(dc: PeerDataConnection) => dc.dataConnection.peer === conn.peer || dc.name === data.name,
												)
											) {
												return prevPeerDataConnections;
											}
											let newPeerChannels = [
												...prevPeerDataConnections,
												{ name: data.name, dataConnection: conn },
											];
											peerDataConnectionsRef.current = newPeerChannels;
											return newPeerChannels;
										},
									);
								}
								break;
							case 'change':
								{
									setMicState((prevState) => !prevState);
								}
								break;
							case 'close':
								// this case should only be for closing mediaConnections
								{
									peerMediaConnectionsRef.current.forEach((pmc: PeerMediaConnection) => {
										if (pmc.mediaConnection.peer === conn.peer) {
											pmc.mediaConnection.close();
										}
									});
								}
								break;
							default:
								break;
						}
					});
					conn.send({ type: 'name', name: username });
				});
				conn.on('error', (e) => {
					console.error('conn error', e);
				});
				conn.on('close', () => {
					setPeerDataConnections(
						(prevPeerDataConnections: Array<PeerDataConnection>) => {
							let filtered = prevPeerDataConnections.filter(
								(pdc: PeerDataConnection) => pdc.dataConnection.peer !== conn.peer,
							);
							// we should close the mediaConnection if the corresponding dataConnection for the peer closes.
							setPeerMediaConnections((prevPeerMediaConnections: Array<PeerMediaConnection>) => {
								prevPeerMediaConnections.forEach((pmc: PeerMediaConnection) => {
									if (pmc.mediaConnection.peer === conn.peer && pmc.mediaConnection.open) {
										pmc.mediaConnection.close();
									}
								});
								let filtered_media = prevPeerMediaConnections.filter(
									(pmc: PeerMediaConnection) =>
										filtered.some(
											(pdc: PeerDataConnection) => pdc.dataConnection.peer === pmc.mediaConnection.peer,
										),
								);
								peerMediaConnectionsRef.current = filtered_media;
								return filtered_media;
							});
							peerDataConnectionsRef.current = filtered;
							return filtered;
						},
					);
				});
			});
		}
	}, [username, HostUsername, myPeerID, glbl.Peer]);

	useEffect(() => {
		if (glbl.authenticated) {
			glbl.setInRoom(true);
		}
	}, [glbl.authenticated]);

	// if the user is a host, we have to set their mic
	useEffect(() => {
		if (isHost) {
			navigator.mediaDevices
				.getUserMedia({ audio: true })
				.then((micMediaStream) => {
					setMediaStream(micMediaStream);
				});
		}
	}, [isHost]);

	// effect is for sending messages. ONLY FOR HOSTS
	useEffect(() => {
		if (message !== null && isHost) {
			let user_conn = peerDataConnectionsRef.current.find((pdc: PeerDataConnection) => pdc.name === message.user);
			if (user_conn !== undefined) {
				user_conn.dataConnection.send({ type: message.type });
			}
		}
	}, [message, isHost]);

	// effect is for users that are turned into speakers by the host.
	useEffect(() => {
		// the reason why I close all the mediaConnections is because I don't want duplicates of mediaConnections for the same pairs of peers.
		// changing the mediaStream, causes an effect to run where the current user calls every dataconnection they have.
		if (micStateForNonHost) {
			peerMediaConnectionsRef.current.forEach((pmc: PeerMediaConnection) => pmc.mediaConnection.close());
			navigator.mediaDevices.getUserMedia({ audio: true }).then(ms => {
				setMediaStream(ms);
			});
		} else {
			msRef.current?.getTracks().forEach(track => track.stop());
			setMediaStream(null);
			msRef.current = null;
			peerMediaConnectionsRef.current.forEach((pmc: PeerMediaConnection) => pmc.mediaConnection.close());
			peerDataConnectionsRef.current.forEach((pdc: PeerDataConnection) => {
				if (
					peerMediaConnectionsRef.current.some((pmc: PeerMediaConnection) =>
						pmc.mediaConnection.peer === pdc.dataConnection.peer
					)
				) {
					pdc.dataConnection.send({ type: 'close' });
				}
			});
		}
	}, [micStateForNonHost]);

	// effect is for host or anyone who is supposed to talk (be a speaker).
	// effect runs when a new dataconnection connects or when the mediaStream changes
	useEffect(() => {
		if (
			_MEDIA_STREAM_ !== null
			&& myPeerID.length > 0
			&& username.length > 0
		) {
			console.log('in the effect for speakers');
			msRef.current = _MEDIA_STREAM_;
			[
				...peerDataConnections.map(
					(pdc: PeerDataConnection) => pdc.dataConnection.peer,
				),
			].forEach((peerid) => {
				if (
					peerid !== myPeerID && peerDataConnections.some((pdc: PeerDataConnection) => pdc.dataConnection.peer === peerid)
					&& glbl.Peer !== null
				) {
					let call: MediaConnection = glbl.Peer.call(peerid, _MEDIA_STREAM_);
					if (call === undefined) {
						return;
					}
					call.on('error', (e) => {
						console.error('call error', e);
					});
					call.on('stream', (remoteStream: MediaStream) => {
						setPeerMediaConnections(
							(prevPeerMediaConnections: Array<PeerMediaConnection>) => {
								let newPeerMediaConnections = [...prevPeerMediaConnections];
								let newMediaConnection: PeerMediaConnection = {
									name: null,
									mediaStream: remoteStream,
									mediaConnection: call,
								};
								peerDataConnections.forEach((pdc: PeerDataConnection) => {
									if (pdc.dataConnection.peer === call.peer) {
										newMediaConnection.name = pdc.name;
									}
								});
								newPeerMediaConnections.push(newMediaConnection);
								peerMediaConnectionsRef.current = newPeerMediaConnections;
								return newPeerMediaConnections;
							},
						);
						console.log('stream added');
					});
					call.on('close', () => {
						console.log('call closed1', call.peer);
						// this part is for when a nonhost who WAS allowed to talk, is turned into a listener
						// This part recalls them, so that they can still hear all the speakers.
						// This gets triggered when the person turning into a listener, closes all of their mediaConnections
						// NOTE that this SHOULD be a one-sided call which is why it isn't added to the peerMediaConnections array.
						if (msRef.current !== null) {
							let recall = glbl.Peer.call(call.peer, msRef.current);
							setPeerMediaConnections((prevPeerMediaConnections: Array<PeerMediaConnection>) => {
								return prevPeerMediaConnections.filter((pmc: PeerMediaConnection) => pmc.mediaConnection.peer !== recall.peer);
							});
						}
					});
				}
			});
		}
	}, [
		_MEDIA_STREAM_,
		myPeerID,
		username,
		peerDataConnections,
	]);

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
						{(isHost || micStateForNonHost)
							? (
								<Roomer
									key={username}
									name={username}
									mediaStream={null}
									RoomTalker={true}
									isHost={isHost}
									setMessage={setMessage}
									username={username}
								/>
							)
							: null}
						{peerMediaConnections.map((pmc: PeerMediaConnection) =>
							(pmc.name === username || (pmc.mediaConnection.open
									&& peerDataConnections.some((pdc: PeerDataConnection) => pdc.name === pmc.name)))
								&& (userSearch.length === 0 || (userSearch.length > 0 && pmc.name.includes(userSearch)))
								? (
									<Roomer
										key={pmc.name}
										name={pmc.name}
										mediaStream={pmc.mediaStream}
										RoomTalker={true}
										isHost={isHost}
										setMessage={setMessage}
										username={username}
									/>
								)
								: null
						)}
					</div>
				</div>
				<div className='h-full w-5/6 md:w-1/2'>
					<h2 className='text-xl font-bold text-center dark:text-white'>listeners</h2>
					<div className='overflow-y-auto w-full flex flex-wrap'>
						{!isHost && !micStateForNonHost
							? (
								<Roomer
									key={username}
									name={username}
									mediaStream={null}
									RoomTalker={false}
									isHost={isHost}
									setMessage={setMessage}
									username={username}
								/>
							)
							: null}
						{peerDataConnections.map((pdc: PeerDataConnection) =>
							((pdc.name === username || pdc.dataConnection.open)
									&& !peerMediaConnections.some(
										(pmc: PeerMediaConnection) => pmc.name === pdc.name,
									))
								&& (userSearch.length === 0 || (userSearch.length > 0 && pdc.name.includes(userSearch)))
								? (
									<Roomer
										key={pdc.name}
										name={pdc.name}
										RoomTalker={false}
										isHost={isHost}
										setMessage={setMessage}
										username={username}
									/>
								)
								: null
						)}
					</div>
				</div>
				<div className='fixed bottom-0 w-full flex justify-center'>
					<Link href='/home'>
						<a className='bg-black text-white shadow shadow-black p-2 rounded m-1'>
							leave
						</a>
					</Link>
					{(micStateForNonHost || isHost) && _MEDIA_STREAM_ !== null
						? (
							<button
								onClick={() => {
									_MEDIA_STREAM_.getTracks().forEach((track: MediaStreamTrack) => track.enabled = !muteState);
									setMuteState((prevState) => !prevState);
								}}
								className='bg-black p-2 text-white rounded m-1 shadow shadow-black'
							>
								{muteState ? 'unmute' : 'mute'} mic
							</button>
						)
						: null}
				</div>
			</div>
		)
		: <div className='h-full w-full flex justify-center items-center text-2xl font-medium'>Loading...</div>;
}
