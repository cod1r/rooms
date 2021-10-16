import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
function CreateRoomForm() {
}

export default function Home() {
	const [room, set_room] = useState('');
	const aud = useRef(null);
	let router = useRouter();
	useEffect(() => {
		(async () => {
			let Peer = (await import('peerjs')).default;
			let peer = new Peer('234982304982342342342342423424');
			peer.on('call', (call) => {
				call.answer();
				call.on('stream', (remoteStream) => {
					aud.current.srcObject = remoteStream;
				})
			});
			peer.on('error', (err) => {
				console.error(err);
			});
		})();
	}, []);

	let handleCreateRoom = (e: Event) => {
		e.preventDefault();
		router.push(room);
	}

  return (
		<div className='bg-red-700 h-full'>
			<div className='flex justify-center p-4'>
				<button className='bg-white p-2 rounded-sm' onClick={() => router.push('urmom')}>Create a room</button>
			</div>
			<div>
				<h1 className='text-xl'>Rooms</h1>
				<audio ref={aud} controls></audio>
			</div>
		</div>
  )
}
