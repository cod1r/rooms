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
		<div className='grid place-items-center h-full'>
			<div className='grid grid-cols-4 grid-rows-3 p-5 rounded md:shadow md:shadow-black'>
				<div className='row-start-1 col-span-4 grid place-items-center text-center'>
					<div>
						<div className='text-5xl text-center font-bold'>rooms</div>
						<div className='text-xl'>where you can</div>
					</div>
				</div>
				{giflist.map((gif, index) => (
					<div
						key={index}
						className='grid place-items-center m-1 rounded-sm p-2'
					>
						<img src={gif.src} alt={gif.alt} width='100px' />
						<div className='text-xl font-bold'>{gif.caption}</div>
					</div>
				))}
				<div className='text-center row-start-3 col-span-4 grid grid-cols-2'>
					<div className='grid place-items-center'>
						<Link href='/register'>
							<a className='text-3xl underline p-2 md:w-48 rounded bg-black text-white'>register</a>
						</Link>
					</div>
					<div className='grid place-items-center'>
						<Link href='/login'>
							<a className='text-3xl underline p-2 md:w-48 rounded bg-black text-white'>login</a>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
