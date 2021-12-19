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
			else {
				// TODO: handle our rejection
			}
		});
	};
	return (
			<div 
				className='mt-1 h-1/3 w-1/4 rounded-sm' 
				onMouseDown={(e) => e.stopPropagation()}>
				<form className='w-full text-center grid place-items-center'>
					<div className='w-full'>
						<label htmlFor='roomname' className='block text-white italic'>room name</label>
						<input 
							onChange={(e) => setRoomName(e.target.value)}
							className='rounded-sm p-1 w-4/5 italic' 
							type='text' 
							name='roomname'
							value={roomname}
							placeholder='your room name'/>
						<div className='m-1'>
							<button className='text-white rounded-sm italic hover:underline' onClick={create_room_handler}>create room</button>
						</div>
					</div>
				</form>
			</div>
	);
}
