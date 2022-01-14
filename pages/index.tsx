import Link from 'next/link';
import router from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import { GLOBALS } from '../contexts/globals';

export default function Index() {
	let glbl = useContext(GLOBALS);
	let gifIndex = useState(0);
	let giflist = [
		{
			src: 'https://c.tenor.com/NHEGSq1lTmAAAAAi/rolling-on-the-floor-laughing-joypixels.gif',
			alt: 'rolling on the floor laughing joypixels sticker',
			caption: 'laugh',
		},
		{
			src: 'https://c.tenor.com/bn2EuicZD3sAAAAi/hot-face-joypixels.gif',
			alt: 'hot face emoji',
			caption: 'sweat',
		},
		{
			src: 'https://c.tenor.com/-GXJw7T3EDYAAAAi/ep00000-emoji.gif',
			alt: 'sobbing face emoji',
			caption: 'cry',
		},
		{
			src: 'https://c.tenor.com/ZLHdbFbs26sAAAAi/kirby-cute.gif',
			alt: 'kirby with headphones dancing',
			caption: 'chill',
		},
	];
	// use effect here just in case register or login doesn't redirect user to home
	useEffect(() => {
		if (glbl.authenticated && !glbl.in_room && router.pathname === '/') {
			router.push('/home');
		}
	}, [glbl.authenticated, glbl.in_room]);
	return (
		<div className='h-full w-full flex flex-col justify-center items-center overflow-y-auto'>
			<div className='shadow shadow-black w-5/6 lg:w-1/4 lg:h-3/6 lg:w-1/2 rounded p-3 min-w-fit'>
				<h1 className='text-3xl md:text-5xl font-bold'>Rooms</h1>
				<ol className='list-decimal list-inside text-md md:text-lg m-1 overflow-y-auto lg:h-5/6 font-semibold'>
					<li className='m-3'>A place to talk.</li>
					<li className='m-3'>A place to discuss.</li>
					<li className='m-3'>A space that is or may be occupied.</li>
					<li className='m-3'>The people present in such an area.</li>
					<li className='m-3'>Suitable opportunity or scope.</li>
				</ol>
			</div>
			<div className='md:text-3xl flex justify-evenly w-5/6 lg:w-1/4 m-3'>
				<div className='flex justify-center m-1'>
					<Link href='/register'>
						<a className='bg-black text-white p-2 rounded shadow shadow-black w-32 md:w-48 text-center'>register</a>
					</Link>
				</div>
				<div className='flex justify-center m-1'>
					<Link href='/login'>
						<a className='bg-black text-white p-2 rounded shadow shadow-black w-32 md:w-48 text-center'>login</a>
					</Link>
				</div>
			</div>
		</div>
	);
}
