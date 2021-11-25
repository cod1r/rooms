import React, { useEffect, useState, useRef, useContext } from 'react'
import { AuthStates } from '../contexts/authstates';
import Auth from '../components/user_auth';
import CreateRoomForm from '../components/createroomform';
import router from 'next/router';

export default function Home() {
	let [register_form_status, setRegisterFormStatus] 	= useState(false);
	let [login_form_status, setLoginFormStatus] 		= useState(false);
	let authstates = useContext(AuthStates);
	let [create_room_form, setCreateRoomForm] 			= useState(false);
	return (
		<div className='grid grid-cols-3 h-full'>
			{	register_form_status ? <Auth close={() => setRegisterFormStatus(!register_form_status)} register_or_login={'register'}/> : null}
			{	login_form_status  ? <Auth close={() => setLoginFormStatus(!login_form_status)} register_or_login={'login'}/> : null}
			{	
				create_room_form ? 
					 <CreateRoomForm 
						close={() => setCreateRoomForm(!create_room_form)} /> 
					: null

			}
			<div className='text-center grid place-items-center'>
				<div>
					<div className='text-xl'>
						A place to talk
					</div>
					{/* bullets only show if you add space for them to show. AKA padding */}
					<ul className='list-disc list-outside text-left'>
						<li>with friends</li>
						<li>with strangers</li>
					</ul>
				</div>
			</div>
			<div className='grid place-items-center'>
				<div className='text-center'>
					<div className='text-xl'>oidua</div>
					{	!authstates.authenticated ? 
						<button className='p-2 m-2 bg-green-400 rounded-sm text-white' onClick={() => setRegisterFormStatus(!register_form_status)}>
							register
						</button> 
							: 
							null
					}
					{	!authstates.authenticated ? 
							<button className='p-2 m-2 bg-green-400 rounded-sm text-white' onClick={() => setLoginFormStatus(!login_form_status)}>
								login
							</button> 
								: 
								null
					}
					{	authstates.authenticated && !authstates.in_room ? 
							<button 
								className='p-2 m-2 bg-green-400 rounded-sm text-white' 
								onClick={() => setCreateRoomForm(!create_room_form)}>create room</button> 
									: 
							null
					}
				</div>
			</div>
			<div className='grid place-items-center'>
				<div className='text-center'>
					<div className='m-1 text-xl'>Search for rooms/people</div>
					<button onClick={() => router.push('/search')}className='bg-green-400 text-white p-2 m-2 rounded-sm'>search</button>
				</div>
			</div>
		</div>
	);
}
