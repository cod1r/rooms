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
		<div className='overflow-y-auto h-full w-full flex flex-col items-center'>
			<div className='text-2xl font-bold text-center flex justify-center m-1'>
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
						className='text-center w-5/6 md:w-full h-full shadow shadow-black resize-none p-1 outline-none rounded'
						onChange={(e) => setTextArea(e.target.value)}
						maxLength={200}
						disabled={!editMode}
						value={textAreaValue}
					>
					</textarea>
					{editMode ? <div>characters left: {200 - textAreaValue.length}</div> : null}
				</div>
			</div>
			<div className='text-xl font-bold border-b border-black w-5/6 text-center pb-2'>My Rooms</div>
			<ul className='overflow-y-auto md:w-1/3 w-full h-full rounded'>
				{rooms.map((room: RoomType) => (
					<li key={room.id} className='text-center'>
						<h1 className='text-lg font-bold'>{room.name}</h1>
						<p className=''>{room.roomDescription}</p>
						<button
							className='bg-black p-2 m-1 text-white rounded shadow shadow-black'
							onClick={async () => {
								let P = new (await import('peerjs')).default();
								glbl.setPeer(P);
								P.on('open', (id) => {
									router.push('/' + room.id);
								});
							}}
						>
							join
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
