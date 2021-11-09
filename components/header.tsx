import { useState, useEffect } from 'react';
import Auth from '../components/user_auth';
import CreateRoomForm from './createroomform';
export default function Header() {
	let [register_form, setRegisterFormStatus] = useState(false);
	let [login_form, setLoginFormStatus] = useState(false);
	let [authenticated, setAuthenticated] = useState(false);
	let [createroom, setCreateRoom] = useState(false);
	useEffect(() => {
		let controller = new AbortController();
		fetch('api/authenticate', {
			method: 'POST',
			signal: controller.signal
		}).then((res) => {
			if (res.status == 200) {
				setAuthenticated(true);
			}
		});
		setTimeout(() => { controller.abort(); }, 5000);
	}, []);
	return (
		<div className='text-center'>
			<h1 className='text-xl'>Audio Rooms</h1>
			{	!authenticated ? <button className='m-1' onClick={() => setRegisterFormStatus(!register_form)}>register</button> : null}
			{	!authenticated ? <button className='m-1' onClick={() => setLoginFormStatus(!login_form)}>login</button> : null}
			{	register_form ? <Auth close={() => setRegisterFormStatus(!register_form)} register={true}/> : null}
			{	login_form  ? <Auth close={() => setLoginFormStatus(!login_form)} register={false}/> : null}
			{	authenticated ? <button className='p-2 m-2 bg-red-700 rounded-lg text-white' onClick={() => setCreateRoom(!createroom)}>Create Room</button> : null}
			{	createroom ? <CreateRoomForm close={() => setCreateRoom(!createroom)} /> : null}
		</div>
	);
}
