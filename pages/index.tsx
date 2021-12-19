import React, { useEffect, useState, useContext } from 'react'
import { GLOBALS } from '../contexts/globals';
import Auth from '../components/user_auth';
import router from 'next/router';
import Image from 'next/image';

export default function Home() {
	let [register_form_status, setRegisterFormStatus] 	= useState(false);
	let [login_form_status, setLoginFormStatus] 		= useState(false);
	let glbl = useContext(GLOBALS);
	useEffect(() => {
		if (glbl.authenticated && !glbl.in_room && router.pathname === '/') {
			console.log(router.pathname);
			router.push('/home');
		}
	}, [glbl.authenticated, glbl.in_room]);
	return (
		<div className='grid place-items-center h-full bg-black'>
			{	
				register_form_status ? 
				<Auth 
					close={() => setRegisterFormStatus(!register_form_status)} 
					register_or_login={'register'}/> : null
			}
			{	
				login_form_status ? 
				<Auth 
					close={() => setLoginFormStatus(!login_form_status)} 
					register_or_login={'login'}/> : null
			}
			<div className='grid grid-cols-4 grid-rows-3 text-white p-5 rounded-md'>
				<div className='row-start-1 col-span-4 grid place-items-center'>
					<div>
						<div className='text-5xl text-center font-bold'>heyxD</div>
						<div className='text-xl'>audio rooms where you can</div>
					</div>
				</div>
				<div className='grid place-items-center m-1 rounded-sm p-2'>
					<Image 
						src="https://c.tenor.com/NHEGSq1lTmAAAAAi/rolling-on-the-floor-laughing-joypixels.gif"
						alt='Rolling On The Floor Laughing Joypixels Sticker' width='100px'/>
					<div className='font-bold'>
						Laugh with ur buddies
					</div>
				</div>
				<div className='grid place-items-center m-1 rounded-sm p-2'>
					<Image
						src="https://c.tenor.com/bn2EuicZD3sAAAAi/hot-face-joypixels.gif"
						alt="Hot face emoji" width='100px'/>
					<div className='font-bold'>
						Sweat with ur buddies
					</div>
				</div>
				<div className='grid place-items-center m-1 rounded-sm p-2'>
					<Image
						src="https://c.tenor.com/-GXJw7T3EDYAAAAi/ep00000-emoji.gif"
						alt="Sobbing emoji" width='100px'/>
					<div className='font-bold'>
						Cry with ur buddies
					</div>
				</div>
				<div className='grid place-items-center m-1 rounded-sm p-2'>
					<Image
						src="https://c.tenor.com/ZLHdbFbs26sAAAAi/kirby-cute.gif"
						alt="Kirby dancing" width='100px'/>
					<div className='font-bold'>
						Chill with ur buddies
					</div>
				</div>
				<div className='text-center row-start-3 col-span-4 grid grid-cols-2'>
						{	!glbl.authenticated ? 
							<div className='grid place-items-center'>
								<button 
									className='text-white italic text-2xl h-1/2 w-1/2 hover:underline' 
									onClick={() => setRegisterFormStatus(!register_form_status)}>
										register
								</button> 
							</div>
								: 
								null
						}
						{	!glbl.authenticated ? 
								<div className='grid place-items-center'>
									<button 
										className='text-white italic text-2xl h-1/2 w-1/2 hover:underline' 
										onClick={() => setLoginFormStatus(!login_form_status)}>
											login
									</button> 
								</div>
									: 
									null
						}
				</div>
			</div>
		</div>
	);
}
