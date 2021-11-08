import '../styles/globals.css'
import { useState } from 'react';
import Auth from '../components/user_auth'
function Header() {
	let [register_form, setRegisterFormStatus] = useState(false);
	let [login_form, setLoginFormStatus] = useState(false);
	return (
		<div className='text-center'>
			<h1 className='text-xl'>Audio Rooms</h1>
			<button className='m-1' onClick={() => setRegisterFormStatus(!register_form)}>register</button>
			<button className='m-1' onClick={() => setLoginFormStatus(!login_form)}>login</button>
			{register_form ? <Auth close={() => setRegisterFormStatus(!register_form)} register={true}/> : null}
			{login_form  ? <Auth close={() => setLoginFormStatus(!login_form)} register={false}/> : null}
		</div>
	);
}
function MyApp({ Component, pageProps }) {
  return (
		<div className='h-screen'>
			<Header/>
			<Component {...pageProps} />
		</div>
	)
}

export default MyApp
