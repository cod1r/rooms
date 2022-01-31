import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { GLOBALS } from '../contexts/globals';
import { HalfMoon, SunLight } from 'iconoir-react';

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
		<div className='h-full w-full flex flex-col items-center dark:bg-slate-800'>
			<div className='text-center text-3xl font-bold w-full dark:text-white text-black'>rooms</div>
			<div className='h-full overflow-y-auto w-5/6'>
				{rooms.map((room: RoomType) => (
					<div key={room.id} className='p-2 m-2 dark:bg-black flex justify-between shadow shadow-violet-800'>
						<div className='w-2/3'>
							<h1 className='break-words overflow-x-hidden overflow-y-hidden text-ellipsis text-left text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent from-indigo-500 via-purple-500 to-pink-500'>
								{room.name}
							</h1>
							<p className='text-black dark:text-white overflow-x-hidden text-ellipsis break-words'>{room.roomDescription}</p>
						</div>
						<Link href={'/' + room.id}>
							<a className='bg-gradient-to-r from-green-400 to-blue-500 rounded text-white font-bold w-1/3 h-10 flex justify-center items-center'>join</a>
						</Link>
					</div>
				))}
			</div>
			<div className='grid grid-cols-3'>
				<Link href='/me'>
					<a className='bg-black p-2 m-1 text-white rounded shadow shadow-black text-center'>me</a>
				</Link>
				<div className='flex justify-center items-center'>
					<div className='flex w-5/6 h-1/2 justify-evenly items-center rounded-l-2xl rounded-r-2xl bg-white shadow shadow-black p-1'>
						<input className='peer hidden' type='checkbox' id='theme' checked={glbl.colorMode === 'light'}/>
						<HalfMoon width={40} height={40}/>
						<label 
							onClick={() => glbl.setColorMode((prev: string) => prev === 'light' ? 'dark':'light')} 
							className='flex peer-checked:justify-end w-full cursor-pointer' 
							htmlFor='theme'>
							<div className='rounded-full bg-black h-4 w-4'></div>
						</label>
						<SunLight width={40} height={40}/>
					</div>
				</div>
				<Link href='/createroom'>
					<a className='bg-black p-2 m-1 text-white rounded shadow shadow-black text-center'>
						create
					</a>
				</Link>
			</div>
		</div>
	);
};

export default Home;
