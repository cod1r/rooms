import { useEffect, useState, useContext, ReactElement } from 'react';
import router from 'next/router';
import CreateRoomForm from '../components/createroomform';
import Search from '../components/search';


function SearchWrapper() {
	return (
		<div className=''>
			<div className='text-white text-2xl'>
				search for something...
			</div>
			<Search/>
		</div>
	);
}
// maybe just show top public rooms
function PublicRooms(): ReactElement {
	return (
		<div className='text-white'>
			<div className='text-2xl'>random public rooms</div>
		</div>
	);
}

export default function Home() {
	let [MenuIndex, setMenuIndex]: [number, React.Dispatch<React.SetStateAction<number>>] = useState(0);
	let MenuOptions: Array<ReactElement> = [
		<CreateRoomForm key={0}/>,
		<SearchWrapper key={1}/>, 
		<PublicRooms key={2}/>, 
	];

	useEffect(() => {
		let controller = new AbortController();
	}, []);


	return (
		<div className='h-full bg-black grid place-items-center'>
			<div className='rounded-md h-5/6 w-5/6 flex flex-col items-center'>
				<div className='text-white'>
					<button 
						className='m-2 hover:underline' 
						onClick={() => setMenuIndex(0)}>
						create room
					</button>
					<button 
						className='m-2 hover:underline' 
						onClick={() => setMenuIndex(1)}>
						search
					</button>
					<button 
						className='m-2 hover:underline' 
						onClick={() => setMenuIndex(2)}>
						public rooms
					</button>
					<button 
						className='m-2 hover:underline' 
						onClick={() => router.push('/profile')}>
						profile
					</button>
				</div>
				<div className='h-full w-full flex justify-center'>
					{ MenuOptions[MenuIndex] }
				</div>
			</div>
		</div>
	);
}
