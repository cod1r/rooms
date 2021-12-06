import React, { useEffect, useState, useRef, useContext } from 'react'
import { GLOBALS } from '../contexts/globals';
import Auth from '../components/user_auth';
import router from 'next/router';

export default function Home() {
	let [register_form_status, setRegisterFormStatus] 	= useState(false);
	let [login_form_status, setLoginFormStatus] 		= useState(false);
	let glbl = useContext(GLOBALS);
	useEffect(() => {
		if (glbl.authenticated && !glbl.in_room && router.pathname === '/') {
			console.log(router.pathname);
			router.push('/home');
		}
	}, []);
	return (
		<div className='grid place-items-center h-full bg-gradient-to-br from-blue-400 to-green-400'>
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
			<div className='grid grid-cols-4 grid-rows-3 bg-white p-5 rounded-md'>
				<div className='row-start-1 col-span-4 grid place-items-center'>
					<div>
						<div className='text-4xl text-center'>heyxD</div>
						<div className='text-xl'>audio rooms where you can</div>
					</div>
				</div>
				<div className='grid place-items-center border-4 border-solid border-green-400 rounded-md p-2 m-1'>
					<img 
						src="https://c.tenor.com/NHEGSq1lTmAAAAAi/rolling-on-the-floor-laughing-joypixels.gif"
						alt='Rolling On The Floor Laughing Joypixels Sticker' width='100px'/>
					<div className='font-bold'>
						Laugh with ur buddies
					</div>
				</div>
				<div className='grid place-items-center border-4 border-solid border-green-400 rounded-md p-2 m-1'>
					<img
						src="https://c.tenor.com/bn2EuicZD3sAAAAi/hot-face-joypixels.gif"
						alt="Hot face emoji" width='100px'/>
					<div className='font-bold'>
						Sweat with ur buddies
					</div>
				</div>
				<div className='grid place-items-center border-4 border-solid border-green-400 rounded-md p-2 m-1'>
					<img
						src="https://c.tenor.com/-GXJw7T3EDYAAAAi/ep00000-emoji.gif"
						alt="Sobbing emoji" width='100px'/>
					<div className='font-bold'>
						Cry with ur buddies
					</div>
				</div>
				<div className='grid place-items-center border-4 border-solid border-green-400 rounded-md p-2 m-1'>
					<img
						src="https://c.tenor.com/ZLHdbFbs26sAAAAi/kirby-cute.gif"
						alt="Kirby dancing" width='100px'/>
					<div className='font-bold'>
						Chill with ur buddies
					</div>
				</div>
				<div className='text-center row-start-3 col-span-4 grid place-items-center'>
					<div>
						{	!glbl.authenticated ? 
							<button 
								className='p-2 m-2 bg-green-400 rounded-sm text-white font-bold text-2xl' 
								onClick={() => setRegisterFormStatus(!register_form_status)}>
									register
							</button> 
								: 
								null
						}
						{	!glbl.authenticated ? 
							<button 
								className='p-2 m-2 bg-green-400 rounded-sm text-white font-bold text-2xl' 
								onClick={() => setLoginFormStatus(!login_form_status)}>
									login
							</button> 
									: 
									null
						}
					</div>
				</div>
			</div>
		</div>
	);
}
