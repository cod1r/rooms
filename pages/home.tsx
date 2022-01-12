import Link from 'next/link';
import { useState } from 'react';

let Home = () => {
	let [rooms, setRooms] = useState([
		{ host: '', name: 'hi', id: '1' },
		{ host: '', name: 'me', id: '2' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
		{ host: '', name: 'me', id: '3' },
	]);
	return (
		<div className='h-full w-full flex flex-col items-center'>
			<div className='text-center text-2xl font-bold'>rooms</div>
			<ul className='text-center w-72 h-full overflow-y-auto border'>
				{rooms.map((room) => (
					<li
						key={room.id}
						className='p-2 m-2 overflow-x-hidden text-ellipsis shadow shadow-black'
					>
						<Link href={'/' + room.id}>
							<a className='underline'>join</a>
						</Link>
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
