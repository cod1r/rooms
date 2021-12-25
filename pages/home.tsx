import { useEffect, useState, useContext, ReactElement } from 'react';
import router from 'next/router';
import { GLOBALS } from '../contexts/globals';
import Link from 'next/link';

function CreateRoomForm() {
	let glbl = useContext(GLOBALS);
	let create_room_handler = (e: React.FormEvent) => {
		e.preventDefault();
		let controller = new AbortController();
		let timeoutID = setTimeout(() => controller.abort(), 5000);
		fetch('api/createroom', {
			method: 'POST',
			signal: controller.signal
		}).then(async (res) => {
			clearTimeout(timeoutID);
			if (res.status == 200) {
				let { roomname } = await res.json();
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
			<div className='bg-black flex items-center justify-center h-full'>
				<div className='grid grid-rows-2'>
					<div className='text-2xl text-center m-2'>
						Are you sure?
					</div>
					<button 
						className='bg-white text-black rounded hover:underline'
						onClick={create_room_handler}>
						yes, create my room
					</button>
				</div>
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
			</div>
			<button 
				onClick={getData} 
				className='m-1 p-1 bg-white text-black rounded hover:underline focus:underline'>
				search
			</button>
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
						<a className='p-2 text-center bg-white text-black rounded hover:underline m-1 focus:underline'>
							profile
						</a>
					</Link>
					<button 
						className='bg-white text-black rounded hover:underline m-1 focus:underline' 
						onClick={() => setComponent(<Search/>)}>
						search
					</button>
					<button 
						className='bg-white text-black rounded hover:underline m-1 focus:underline' 
						onClick={() => setComponent(<PublicRooms/>)}>
						public
					</button>
					<button 
						className='bg-white text-black rounded hover:underline m-1 focus:underline' 
						onClick={() => setComponent(<CreateRoomForm/>)}>
						create
					</button>
				</div>
			</div>
			{ component }
		</div>
	);
}
