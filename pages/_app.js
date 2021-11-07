import '../styles/globals.css'
import { useState } from 'react';
import Register from '../components/user_auth'
function Header() {
	let [register_form, setRegisterFormStatus] = useState(false);
	return (
		<div className='text-center'>
			<h1 className='text-xl'>Audio Rooms</h1>
			<button onClick={() => setRegisterFormStatus(!register_form)}>register</button>
			{register_form ? <Register close={setRegisterFormStatus}/> : null}
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
