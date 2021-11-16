import React, { useEffect, useState, useRef } from 'react'

export default function Home() {
	let [search_val, setSearchValue] = useState('');
	useEffect(() => {
		fetch('api/search', {
			method: 'GET'
		}).then(async (res) => {
			if (res.status == 200) {
				let rooms = await res.json();
				sessionStorage.setItem('rooms', JSON.stringify(rooms));
			}
		});
	}, []);
	return (
		<div className=''>
			<div className='flex justify-center'>
				<form className='text-center'>
					<label className='block text-xl' htmlFor='search'>Search for rooms</label>
					<input onChange={(e) => setSearchValue(e.target.value)}className='outline-none border border-solid border-black p-2' type='text' name='search' value={search_val}/>
				</form>
			</div>
			{ /*JSON.parse(sessionStorage.getItem('rooms'))['rooms']?.map((room) => room.includes(search_val) && search_val.length > 0 ? <div>{room}</div> : null)*/ }
		</div>
	)
}
