import router from 'next/router';
import CreateRoomForm from '../components/createroomform';

export default function Header() {
	let locations = ['home', 'create room', 'search'];
	let links = {
		'home': '/home',
		'search': '/search'
	};
	let linkOperations = {
		'home': () => router.push(links['home']),
		'search': () => router.push(links['search']),
		'create room': () => {}
	}
	return (
		<div className='flex justify-center p-2'>
			<div className='sticky grid grid-cols-3 text-center col-start-2'>
				{ 
					locations.map((location, index) => 
						<div key={index}>
							<button 
								className='text-white bg-green-400 p-2 rounded-sm font-bold' 
								onClick={linkOperations[location]}>
								{location}
							</button>
						</div>
					)
				}
			</div>
			<div>
			</div>
		</div>
	);
}
