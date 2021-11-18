import { useState, useEffect, useContext } from 'react';
import Auth from '../components/user_auth';
import CreateRoomForm from './createroomform';
import { AuthStates } from '../contexts/authstates';
import router from 'next/router';
export default function Header(props) {
	let [register_form_status, setRegisterFormStatus] 	= useState(false);
	let [login_form_status, setLoginFormStatus] 		= useState(false);
	let authstates = useContext(AuthStates);
	let [create_room_form, setCreateRoomForm] 			= useState(false);
	return (
		<div className='text-center'>
			<h1 className='text-xl'><button onClick={() => router.push('/')}>Audio Rooms</button></h1>
			{	!authstates.authenticated ? 
				<button className='p-2 m-2 bg-red-700 rounded-lg text-white' onClick={() => setRegisterFormStatus(!register_form_status)}>
					register
				</button> 
					: 
					null
			}
			{	!authstates.authenticated ? 
					<button className='p-2 m-2 bg-red-700 rounded-lg text-white' onClick={() => setLoginFormStatus(!login_form_status)}>
						login
					</button> 
						: 
						null
			}
			{	register_form_status ? <Auth close={() => setRegisterFormStatus(!register_form_status)} register_or_login={'register'}/> : null}
			{	login_form_status  ? <Auth close={() => setLoginFormStatus(!login_form_status)} register_or_login={'login'}/> : null}
			{	authstates.authenticated && !(authstates.in_room) ? 
					<button 
						className='p-2 m-2 bg-red-700 rounded-lg text-white' 
						onClick={() => setCreateRoomForm(!create_room_form)}>Create Room</button> 
							: 
					null
			}
			{	
				(create_room_form) ? 
					 <CreateRoomForm 
						close={() => setCreateRoomForm(!create_room_form)} /> 
					: null

			}
		</div>
	);
}
