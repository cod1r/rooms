import { useState } from 'react';
import router from 'next/router';

export default function Search() {
	let [option, setOption] = useState('room');
	let [results, setResults] = useState([]);
	let [query, setQuery] = useState('');
	let getData = (e: React.MouseEvent) => {
		//fetch(option === 'user' ? 'api/getusers' : 'api/getrooms', {
		//	method: 'GET',
		//	body: JSON.stringify({
		//		query: query
		//	}),
		//});
	}
	return (
		<div className='text-center'>
			<select 
				defaultValue={option} 
				className='outline-none border border-solid border-green-400 m-5 p-2 rounded-sm' 
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
					className='outline-none border border-solid border-green-400 p-2 rounded-sm' 
					type='search' 
					placeholder={`search for a ${option}...`} 
					value={query}/>
				<button onClick={getData} className='text-white bg-green-400 rounded-sm p-2 m-2'>search</button>
			</div>
			<div>
				<div className='text-xl'>Results</div>
				<ul>
					{ results.map((result) => <li>{result}</li>) }
				</ul>
			</div>
		</div>
	);
}
