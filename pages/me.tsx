import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { GLOBALS } from '../contexts/globals';
interface RoomType {
	name: string;
	id: string;
	numPeople?: number;
	roomDescription: string;
}
export default function Profile() {
	let router = useRouter();
	let glbl = useContext(GLOBALS);
	let [username, setUsername]: [string, any] = useState('');
	let [bio, setBio]: [string, any] = useState('');
	let [textAreaValue, setTextArea]: [string, any] = useState('');
	let [editMode, setEditMode]: [boolean, any] = useState(Boolean(false));
	let [rooms, setRooms]: [Array<RoomType>, any] = useState([]);
	let textAreaRef = useRef(null);

	useEffect(() => {
		let controller = new AbortController();
		let timeoutid = setTimeout(() => controller.abort(), 5000);

		fetch('/api/myinfo', {
			method: 'POST',
			body: JSON.stringify({
				type: 'get',
			}),
			signal: controller.signal,
		}).then(async (res) => {
			clearTimeout(timeoutid);
			let { usernameDB, bioDB, roomsDB } = await res.json();
			setUsername(usernameDB);
			setBio(bioDB);
			setTextArea(bioDB);
			setRooms(roomsDB);
		});
	}, []);

	useEffect(() => {
		if (editMode) {
			textAreaRef.current.focus();
		}
	}, [editMode]);

	let editprofile = (e) => {
		if (editMode === false) {
			setEditMode(true);
		} else {
			let controller = new AbortController();
			let timeoutid = setTimeout(() => controller.abort(), 5000);
			fetch('/api/myinfo', {
				method: 'POST',
				body: JSON.stringify({
					type: 'edit',
					bio: textAreaValue,
				}),
				signal: controller.signal,
			}).then((res) => {
				if (res.ok) {
					clearTimeout(timeoutid);
					setBio(textAreaValue);
					setEditMode(false);
				} else {
					console.error('no 200');
				}
			});
		}
	};

	return (
		<div className='overflow-y-auto h-full w-full flex flex-col items-center dark:bg-slate-800'>
			<div className='text-2xl font-bold text-center flex justify-center m-1 dark:text-white'>
				{username}
			</div>
			<div className='w-full md:w-1/3 flex flex-col items-center'>
				<div className='flex justify-center'>
					<button className='bg-black p-2 m-1 text-white rounded shadow shadow-black' onClick={editprofile}>
						{editMode === false ? 'edit bio' : 'submit'}
					</button>
					{editMode
						? (
							<button
								className='bg-black p-2 m-1 text-white rounded shadow shadow-black'
								onClick={() => {
									setEditMode(false);
									setTextArea(bio);
								}}
							>
								cancel
							</button>
						)
						: null}
				</div>
				<div className='w-full h-48 flex flex-col items-center m-2'>
					<textarea
						ref={textAreaRef}
						className='text-center w-5/6 md:w-full h-full shadow shadow-black resize-none p-1 outline-none rounded dark:bg-gray-300'
						onChange={(e) => setTextArea(e.target.value)}
						maxLength={200}
						disabled={!editMode}
						value={textAreaValue}
					>
					</textarea>
					{editMode ? <div className='dark:text-white'>characters left: {200 - textAreaValue.length}</div> : null}
				</div>
			</div>
			<div className='text-xl font-bold border-b border-black w-5/6 text-center pb-2 dark:text-white'>My Rooms</div>
			<div className='h-full overflow-y-auto w-5/6'>
				{rooms.map((room: RoomType) => (
					<div key={room.id} className='p-1 m-2 dark:bg-black flex justify-between'>
						<div className='w-2/3 m-1'>
							<h1 className='break-wordsoverflow-y-hidden text-ellipsis text-left text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-indigo-500 via-purple-500 to-pink-500'>
								{room.name}
							</h1>
							<p className='text-black dark:text-white overflow-y-auto text-ellipsis break-words h-16'>{room.roomDescription}</p>
						</div>
						<div className='w-1/3 flex flex-col items-center justify-center'>
							<Link href={'/' + room.id}>
								<a className='m-1 bg-gradient-to-r from-green-400 to-blue-500 rounded text-white font-bold w-full h-10 flex justify-center items-center'>join</a>
							</Link>
							<button
								onClick={() => {
									fetch('/api/removeroom', {
										method: 'POST',
										body: JSON.stringify({
											roomid: room.id
										})
									}).then(async (res) => {
										if (res.ok) {
											setRooms((rooms) => rooms.filter((room) => room.id !== room.id));
										}
									}).catch(e => console.error(e));
								}}
								className='m-1 bg-gradient-to-r from-green-400 to-blue-500 rounded text-white font-bold w-full h-10 flex justify-center items-center'>
								delete
							</button>
						</div>
						
					</div>
				))}
			</div>
		</div>
	);
}
