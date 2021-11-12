import React, { useEffect, useState, useRef } from 'react'

export default function Home() {
	let [search_val, setSearchValue] = useState('');
	let search_handler = (e) => {
		e.preventDefault();
	};
	return (
		<div className=''>
			<div className='flex justify-center'>
				<form className='text-center'>
					<label className='block text-xl' htmlFor='search'>Search for rooms</label>
					<input onChange={(e) => setSearchValue(e.target.value)}className='outline-none border border-solid border-black p-2' type='text' name='search' value={search_val}/>
					<div className='flex justify-center p-1'>
						<button className='bg-black text-white p-2' onClick={search_handler}>search</button>
					</div>
				</form>
			</div>
		</div>
	)
}
