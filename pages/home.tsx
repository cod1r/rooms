import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { GLOBALS } from '../contexts/globals';

interface RoomType {
	name: string;
	id: string;
	numPeople?: number;
	roomDescription: string;
}

let Home = () => {
	let glbl = useContext(GLOBALS);
	let router = useRouter();
	let [rooms, setRooms]: [Array<RoomType>, any] = useState([]);
	useEffect(() => {
		fetch('/api/rooms', {
			method: 'POST',
		}).then(async (res) => {
			if (res.ok) {
				let { roomsDB } = await res.json();
				setRooms(roomsDB);
			} else {
			}
		});
	}, []);
	return (
		<div className='h-full w-full flex flex-col items-center'>
			<div className='text-center text-2xl font-bold'>rooms</div>
			<ul className='text-center w-5/6 md:w-1/3 h-full overflow-y-auto shadow shadow-black rounded'>
				{rooms.map((room: RoomType) => (
					<li key={room.id} className='text-center'>
						<h1 className='text-lg font-bold'>{room.name}</h1>
						<p className=''>{room.roomDescription}</p>
						<button
							className='bg-black p-2 m-1 text-white rounded shadow shadow-black'
							onClick={() => {
								router.push('/' + room.id);
							}}
						>
							join
						</button>
					</li>
				))}
			</ul>
			<div className='block grid grid-cols-2'>
				<Link href='/me'>
					<a className='bg-black p-2 m-1 text-white rounded shadow shadow-black text-center'>me page</a>
				</Link>
				<Link href='/createroom'>
					<a className='bg-black p-2 m-1 text-white rounded shadow shadow-black text-center'>
						create room
					</a>
				</Link>
			</div>
		</div>
	);
};

export default Home;
