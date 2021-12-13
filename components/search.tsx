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
				query: query
			}),
			signal: controller.signal
		}).then(async (res) => {
			clearTimeout(timeoutID);

			let { rooms } = await res.json();
			
			setResults(rooms);
		});
	}
	return (
		<div className='text-center'>
			<select 
				defaultValue={option} 
				className='m-2 p-1 rounded-sm' 
				onChange={
						(e) => e.target.value === 'room' ? 
						setOption('room') 
						: 
						setOption('user')
				}>
				<option value='user'>looking for user...</option>
				<option value='room'>looking for room...</option>
			</select>
			<div>
				<input 
					onChange={(e) => setQuery(e.target.value)} 
					className='p-1 rounded-sm' 
					type='search' 
					placeholder={`search for a ${option}...`} 
					value={query}/>
				<button onClick={getData} className='bg-white p-1 rounded-sm m-2'>search</button>
			</div>
			<div>
				<div className='text-2xl text-white'>Results</div>
				<ul>
					{ 
						results.map((res, index) => 
							<li key={index} className='text-white'>
								<Link href={`/${res}`}>
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
