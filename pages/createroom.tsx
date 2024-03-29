import router from 'next/router';
import { useContext, useState } from 'react';
import { GLOBALS } from '../contexts/globals';
import { getStringLength } from '../utils/utils';

let CreateRoom = () => {
	let [roomname, setRoomName] = useState('');
	let [roomDesc, setRoomDesc] = useState('');
	let [errorMsg, setError] = useState('');
	let glbl = useContext(GLOBALS);
	return (
		<div className='h-full w-full flex justify-center items-center dark:bg-slate-800'>
			<form className='flex flex-col items-center justify-center w-5/6 h-full md:h-1/2 md:w-1/2 md:shadow md:shadow-black md:p-5 md:rounded'>
				<label className='block font-bold dark:text-white' htmlFor='roomname'>The Room Name</label>
				<input
					className='ring ring-black p-1 rounded md:w-1/2 outline-none w-full'
					type='text'
					name='roomname'
					onChange={(e) => setRoomName(e.target.value)}
					value={roomname}
					minLength={10}
					maxLength={30}
					required
				/>
				<div className='dark:text-white'>characters left: {30 - roomname.length}</div>
				<label className='block font-bold dark:text-white' htmlFor='roomdesc'>The Room Description</label>
				<textarea
					className='ring ring-black rounded p-1 resize-none w-full h-1/4 md:w-1/2 md:h-1/3 outline-none'
					onChange={(e) => setRoomDesc(e.target.value)}
					value={roomDesc}
					minLength={20}
					maxLength={150}
					required
				>
				</textarea>
				<div className='dark:text-white'>characters left: {150 - roomDesc.length}</div>
				<button
					className='p-2 m-1 bg-black text-white rounded shadow shadow-black'
					onClick={(e) => {
						e.preventDefault();
						if (getStringLength(roomname) < 10 || getStringLength(roomDesc) < 20) {
							// TODO: tell user that they must make those lengths longer
							setError('room name must be longer than 10 characters and room description must be longer than 20');
							return;
						}
						fetch('/api/createroom', {
							method: 'POST',
							body: JSON.stringify({
								roomname: roomname,
								roomdescription: roomDesc,
							}),
						}).then(async (res) => {
							if (res.ok) {
								let { roomid } = await res.json();
								router.push('/' + roomid);
							} else {
								// TODO: handle rejection
							}
						});
					}}
				>
					create room
				</button>
				<div className='w-full break-words text-center dark:text-white'>{errorMsg}</div>
			</form>
		</div>
	);
};

export default CreateRoom;
