import { useEffect, useState, useContext, ReactElement } from 'react';
import router from 'next/router';
import { GLOBALS } from '../contexts/globals';
import Link from 'next/link';

function CreateRoomForm() {
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
			<div className='bg-black mt-1 rounded-sm flex justify-center h-full'>
				<form className='w-full text-center grid place-items-center md:w-1/3'>
					<div className='w-full'>
						<label htmlFor='roomname' className='block text-2xl mb-1'>Room name</label>
						<input 
							onChange={(e) => setRoomName(e.target.value)}
							className='rounded-sm p-1 w-4/5 outline-none text-black' 
							type='text' 
							name='roomname'
							value={roomname}
							placeholder='your room name'/>
						<div className='m-1'>
							<button 
								className='text-2xl rounded-sm hover:underline' 
								onClick={create_room_handler}>
								create room
							</button>
						</div>
					</div>
				</form>
			</div>
	);
}


function Search() {
	let [option, setOption] = useState('room');
	let [results, setResults] = useState([]);
	let [query, setQuery] = useState('');

	let getData = (e: React.MouseEvent) => {
		let controller = new AbortController();
		let timeoutID = setTimeout(() => controller.abort(), 5000);
		fetch(option === 'user' ? 'api/getusers' : 'api/getrooms', {
			method: 'POST',
			body: JSON.stringify({
				querytype: 'search',
				search: query
			}),
			signal: controller.signal
		}).then(async (res) => {
			clearTimeout(timeoutID);

			if (option === 'room') {
				let { rooms } = await res.json();
				setResults(rooms);
			}
			else {
				let { buddies } = await res.json();
				setResults(buddies);
			}
		});
	}
	return (
		<div className='text-center'>
			<span className='m-2'>
				<input 
					onChange={() => setOption('room')} 
					type='radio' 
					id='room' 
					name='searchvalue' 
					value='room' 
					checked={option === 'room'}/>
				<label 
					className='' 
					htmlFor='room'>
					room
				</label>
			</span>
			<span className='m-2'>
				<input 
					onChange={() => setOption('user')} 
					type='radio' 
					id='user' 
					name='searchvalue' 
					value='user' />
				<label 
					className='' 
					htmlFor='user'>
					user
				</label>
			</span>
			<div>
				<input 
					onChange={(e) => setQuery(e.target.value)} 
					className='p-1 rounded-sm outline-none text-black' 
					type='search' 
					placeholder={`search for a ${option}...`} 
					value={query}/>
				<button 
					onClick={getData} 
					className=' p-1 rounded-sm m-2 hover:underline'>
					search
				</button>
			</div>
			<div>
				<div 
					className='text-2xl '>
					Results
				</div>
				<ul>
					{ 
						option === 'room' ?
						results.map((res, index) => 
							<li key={index} className=''>
								<Link href={`/${res}`}>
									<a className='hover:underline'>{res}</a>
								</Link>
							</li>
						) 
						:
						results.map((res, index) =>
							<li key={index} className=''>
								<Link href={`user/${res}`}>
									<a className='hover:underline'>{res}</a>
								</Link>
							</li>
						)
					}
				</ul>
			</div>
		</div>
	);
}

// maybe just show top public rooms
function PublicRooms(): ReactElement {
	return (
		<div className=''>
			<div className='text-2xl text-center'>random public rooms</div>
		</div>
	);
}

export default function Home() {
	let [component, setComponent] = useState(<PublicRooms/>);

	return (
		<div className='h-full text-white bg-black'>
			<div className='p-1'>
				<div className='grid grid-cols-4'>
					<Link href='/profile'>
						<a className='p-2 text-center focus:ring focus:ring-white'>
							profile
						</a>
					</Link>
					<button 
						className='p-2 focus:ring focus:ring-white' 
						onClick={() => setComponent(<Search/>)}>
						search
					</button>
					<button 
						className='p-2 focus:ring focus:ring-white' 
						onClick={() => setComponent(<PublicRooms/>)}>
						public
					</button>
					<button 
						className='p-2 focus:ring focus:ring-white' 
						onClick={() => setComponent(<CreateRoomForm/>)}>
						create
					</button>
				</div>
			</div>
			{ component }
		</div>
	);
}
