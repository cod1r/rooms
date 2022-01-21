import Link from 'next/link';
import router from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { GLOBALS } from '../contexts/globals';

export default function Index() {
	let glbl = useContext(GLOBALS);
	// use effect here just in case register or login doesn't redirect user to home
	useEffect(() => {
		if (glbl.authenticated && !glbl.in_room && router.pathname === '/') {
			router.push('/home');
		}
	}, [glbl.authenticated, glbl.in_room]);
	return (
		<div className='h-full w-full flex flex-col justify-center items-center overflow-y-auto'>
			<div className='flex flex-col items-center'>
				<h1 className='text-4xl font-bold'>Rooms</h1>
				<div className='text-2xl'>A place to talk/discuss</div>
				<div className='text-2xl'>Audio rooms for random purposes</div>
			</div>
			<div className='md:text-3xl flex justify-evenly w-5/6 lg:w-1/4 m-3'>
				<div className='flex justify-center m-1'>
					<Link href='/register'>
						<a className='bg-black text-white p-2 rounded shadow shadow-black w-32 text-center'>register</a>
					</Link>
				</div>
				<div className='flex justify-center m-1'>
					<Link href='/login'>
						<a className='bg-black text-white p-2 rounded shadow shadow-black w-32 text-center'>login</a>
					</Link>
				</div>
			</div>
		</div>
	);
}
