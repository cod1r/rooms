import Link from 'next/link';
import router from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { GLOBALS } from '../contexts/globals';

// the function that gets returned from a useEffect function is that function
// that cleans up the PREVIOUS effect

interface DataChannelDataType {
	type: string;
	name?: string;
	peerid?: string;
	PeerIDs?: Array<string>;
	Talking?: Array<string>;
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

let Audio = (props: {
	peer: string;
	className?: string;
	mediaStream: MediaStream;
	muted: boolean;
	isHost: boolean;
}) => {
	let AudioRef = useRef(null);
	let ContainerRef = useRef(null);
	useEffect(() => {
		AudioRef.current.srcObject = props.mediaStream;
	}, [props.mediaStream, props.peer]);
	return <div></div>;
};

let useConnect = () => {
	let [HostPeerID, setHostPeerID] = useState('');
	let [username, setUsername] = useState('');
	useEffect(() => {
		let { room } = router.query;
		fetch('/api/joinroom', {
			method: 'POST',
			body: JSON.stringify({
				roomid: room,
			}),
		}).then(async (res) => {
			if (res.ok) {
				let { HostPeerID, username } = await res.json();
				setHostPeerID(HostPeerID);
				setUsername(username);
			} else {
				router.push('/');
			}
		});
	}, []);
	return { HostPeerID: HostPeerID, username: username };
};

export default function Room() {
	let glbl = useContext(GLOBALS);
	let { HostPeerID, username } = useConnect();
	let [_HostPeerID_, setHostPeerID]: [string, any] = useState(HostPeerID);
	let [Loaded, setLoaded] = useState(false);
	let [_MEDIA_STREAM_, setMediaStream]: [MediaStream, any] = useState(
		new MediaStream(),
	);
	let [micState, setMicState] = useState(null);
	let [peerDataConnections, setPeerDataConnections]: [
		Array<PeerDataConnection>,
		any,
	] = useState([]);
	let [peerMediaConnections, setPeerMediaConnections]: [
		Array<PeerMediaConnection>,
		any,
	] = useState([]);
	let [hostDataConnection, setDataHostConnection]: [PeerDataConnection, any] = useState(null);
	let msRef = useRef(_MEDIA_STREAM_);
	let peerRef = useRef(glbl.Peer);
	let peerDataConnectionsRef = useRef(peerDataConnections);
	// these might close by themselves
	let peerMediaConnectionsRef = useRef(peerMediaConnections);
	let timerID = useRef(null);

	useEffect(() => {
		// cleans up after the component unmounts
		return () => {
			msRef.current
				.getTracks()
				.forEach((track: MediaStreamTrack) => track.stop());
			peerDataConnectionsRef.current.forEach((connection) => connection.dataConnection.close());
			peerRef.current?.destroy();
			clearTimeout(timerID.current);
		};
	}, []);

	useEffect(() => {
		if (_HostPeerID_.length > 0 && glbl.Peer.id !== _HostPeerID_) {
			setHostPeerID(HostPeerID);
			let conn = glbl.Peer.connect(_HostPeerID_);
			conn.on('open', () => {
				conn.on('data', (HostData: DataChannelDataType) => {
					switch (HostData.type) {
						case 'init':
							{
								setDataHostConnection({
									name: HostData.name,
									dataConnection: conn,
								});
								setPeerDataConnections((prevPeerDataConnections) => {
									let newPeerConnections = [
										...prevPeerDataConnections,
										{
											name: HostData.name,
											dataConnection: conn,
										},
									];
									peerDataConnectionsRef.current = newPeerConnections;
									return newPeerConnections;
								});
								HostData.PeerIDs.forEach((peerID) => {
									let peerconnection = glbl.Peer.connect(peerID);
									peerconnection.on('open', () => {
										peerconnection.on(
											'data',
											(PeerData: DataChannelDataType) => {
												setPeerDataConnections(
													(
														prevPeerDataConnections: Array<PeerDataConnection>,
													) => {
														let newPeerConnections = [
															...prevPeerDataConnections,
															{
																name: PeerData.name,
																dataConnection: conn,
															},
														];
														peerDataConnectionsRef.current = newPeerConnections;
														return newPeerConnections;
													},
												);
											},
										);
										peerconnection.send({ name: username });
									});
									peerconnection.on('error', (e) => {
										console.error('peerconnection error', e);
									});
									peerconnection.on('close', () => {
										setPeerDataConnections(
											(prevPeerDataConnections: Array<PeerDataConnection>) => {
												console.log(
													'find?',
													prevPeerDataConnections.find(
														(peerStream: PeerDataConnection) =>
															peerStream.dataConnection.peer
																=== peerconnection.peer,
													),
												);
												return prevPeerDataConnections.filter(
													(peerStream: PeerDataConnection) =>
														peerStream.dataConnection.peer
															!== peerconnection.peer,
												);
											},
										);
									});
								});
							}
							break;
						case 'mute':
							{
							}
							break;
						case 'off_stage':
							{
							}
							break;
						case 'on_stage':
							{
							}
							break;
						default:
							break;
					}
				});
				conn.send({ name: username });
			});
			conn.on('error', (e) => {
				console.log('conn error', e);
			});
			conn.on('close', () => {
			});
		}
	}, [HostPeerID]);

	useEffect(() => {
		if (username.length > 0) {
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
							let newPeerConnections = [
								...prevPeerMediaConnections,
								{
									name: null,
									mediaStream: remoteStream,
									mediaConnection: call,
								},
							];
							return newPeerConnections;
						},
					);
					console.log('open?', call.open);
				});
				call.on('close', () => {
					console.log(call.peer, 'closed');
				});
			});

			glbl.Peer.on('connection', (conn) => {
				conn.on('open', () => {
					conn.on('data', (data: DataChannelDataType) => {
						// we put the setstate function in here because we get
						// access to the data information but this also means that this callback
						// only runs when the remote peer on the other end sends information once the connection is
						// established
						setPeerDataConnections(
							(prevPeerDataConnections: Array<PeerDataConnection>) => {
								if (prevPeerDataConnections.some((dc: PeerDataConnection) => dc.dataConnection.peer === conn.peer)) {
									return prevPeerDataConnections;
								}
								let newPeerChannels = [
									...prevPeerDataConnections,
									{ name: data.name, dataConnection: conn },
								];
								peerDataConnectionsRef.current = newPeerChannels;
								// for host
								if (glbl.Peer.id === _HostPeerID_) {
									let peercall = glbl.Peer.call(conn.peer);
									peercall.on('stream', (remoteStream: MediaStream) => {
										setPeerMediaConnections(
											(prevPeerMediaConnections: Array<PeerMediaConnection>) => {
												let newPeerConnections = [
													...prevPeerMediaConnections,
													{
														name: null,
														mediaStream: remoteStream,
														mediaConnection: peercall,
													},
												];
												return newPeerConnections;
											},
										);
									});
								}
								conn.send({ type: 'init', name: username });
								return newPeerChannels;
							},
						);
					});
				});
				conn.on('error', (e) => {
					console.log('conn error', e);
				});
				conn.on('close', () => {
					console.log(conn.peer, 'ended0', peerRef.current);
					setPeerDataConnections(
						(prevPeerDataConnections: Array<PeerDataConnection>) => {
							console.log(
								'find?',
								prevPeerDataConnections.find(
									(peerStream: PeerDataConnection) => peerStream.dataConnection.peer === conn.peer,
								),
							);
							return prevPeerDataConnections.filter(
								(peerStream: PeerDataConnection) => peerStream.dataConnection.peer !== conn.peer,
							);
						},
					);
				});
			});
		}
	}, [username]);

	useEffect(() => {
		if (glbl.authenticated) {
			glbl.setInRoom(true);
		}
	}, [glbl.authenticated]);

	return Loaded !== null && glbl.authenticated === true
		? (
			<div className='h-full w-full'>
			</div>
		)
		: (
			'Loading...'
		);
}
