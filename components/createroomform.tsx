import React, { useState, useEffect } from 'react';
interface CreateRoomFormProps {
	close: () => void
}
export default function CreateRoomForm(props : CreateRoomFormProps) {
	let [roomname, setRoomName] = useState('');
	let create_room_handler = (e) => {
		e.preventDefault();
		let controller = new AbortController();
		fetch('api/createroom', {
			method: 'POST',
			body: JSON.stringify({
				roomname: roomname
			}),
			signal: controller.signal
		});
		setTimeout(() => controller.abort(), 5000);
	};
	return (
		<div className='absolute top-0 left-0 h-full w-full bg-black bg-opacity-50' onMouseDown={props.close}>
			<div className='relative top-1/4 left-1/3 h-1/2 w-1/3 bg-white rounded-lg' onMouseDown={(e) => e.stopPropagation()}>
				<form>
					<label>
						<div>room name</div>
						<input 
							onChange={(e) => setRoomName(e.target.value)}
							className='outline-none border border-solid border-black focus:ring-2 focus:ring-red-400 rounded-lg p-1' 
							type='text' 
							name='roomname'
							value={roomname}/>
					</label>
					<button onClick={create_room_handler}></button>
				</form>
			</div>
		</div>
	);
}
