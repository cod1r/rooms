import React, { useState, useContext } from 'react';
import { GLOBALS } from '../contexts/globals';
import router from 'next/router';

export default function CreateRoomForm() {
	let glbl = useContext(GLOBALS);
	let [roomname, setRoomName] = useState('');
	let create_room_handler = (e: React.FormEvent) => {
		e.preventDefault();
		let controller = new AbortController();
		let timeoutID = setTimeout(() => controller.abort(), 5000);
		fetch('api/createroom', {
			method: 'POST',
			body: JSON.stringify({
				roomname: roomname,
			}),
			signal: controller.signal
		}).then((res) => {
			clearTimeout(timeoutID);
			if (res.status == 200) {
				router.push(roomname);
				console.log('room created');
				glbl.setInRoom(true);
			}
		});
	};
	return (
			<div 
				className='mt-1 h-1/3 w-1/4 bg-white rounded-sm flex items-center justify-center' 
				onMouseDown={(e) => e.stopPropagation()}>
				<form className='w-full h-1/2 text-center grid place-items-center'>
					<div className='w-1/2'>
						<label htmlFor='roomname' className='block'>room name</label>
						<input 
							onChange={(e) => setRoomName(e.target.value)}
							className='outline-none border border-solid border-green-400 rounded-sm p-1 w-4/5' 
							type='text' 
							name='roomname'
							value={roomname}
							placeholder='your room name'/>
						<div className='m-2'>
							<button className='p-2 m-2 bg-green-400 rounded-sm text-white' onClick={create_room_handler}>create my room</button>
						</div>
					</div>
				</form>
			</div>
	);
}
