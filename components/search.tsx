import { useState } from 'react';
import Link from 'next/link';

export default function Search() {
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
					className='text-white' 
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
					className='text-white' 
					htmlFor='user'>
					user
				</label>
			</span>
			<div>
				<input 
					onChange={(e) => setQuery(e.target.value)} 
					className='p-1 rounded-sm' 
					type='search' 
					placeholder={`search for a ${option}...`} 
					value={query}/>
				<button 
					onClick={getData} 
					className='text-white p-1 rounded-sm m-2 hover:underline'>
					search
				</button>
			</div>
			<div>
				<div 
					className='text-2xl text-white'>
					Results
				</div>
				<ul>
					{ 
						option === 'room' ?
						results.map((res, index) => 
							<li key={index} className='text-white'>
								<Link href={`/${res}`}>
									<a className='hover:underline'>{res}</a>
								</Link>
							</li>
						) 
						:
						results.map((res, index) =>
							<li key={index} className='text-white'>
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
