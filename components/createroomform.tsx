import React, { useState, useEffect, useContext } from 'react';
import { AuthStates } from '../contexts/authstates';
import router from 'next/router';
interface CreateRoomFormProps {
	close: () => void,
}
export default function CreateRoomForm(props : CreateRoomFormProps) {
	let authstates = useContext(AuthStates);
	let [roomname, setRoomName] = useState('');
	let create_room_handler = (e) => {
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
				props.close();
				console.log('room created');
				authstates.setInRoom();
			}
		});
	};
	return (
		<div className='absolute top-0 left-0 h-full w-full bg-black bg-opacity-50' onMouseDown={props.close}>
			<div className='relative top-1/4 left-1/3 h-1/2 w-1/3 bg-white rounded-lg flex items-center justify-center' onMouseDown={(e) => e.stopPropagation()}>
				<form className='w-full h-1/2'>
					<label htmlFor='roomname' className='block'>room name</label>
					<input 
						onChange={(e) => setRoomName(e.target.value)}
						className='outline-none border border-solid border-black focus:ring-2 focus:ring-red-400 rounded-lg p-1 w-4/5' 
						type='text' 
						name='roomname'
						value={roomname}
						placeholder='your room name'/>
					<div className='m-2'>
						<button className='p-2 text-white rounded-lg bg-red-700' onClick={create_room_handler}>create my room</button>
					</div>
				</form>
			</div>
		</div>
	);
}
