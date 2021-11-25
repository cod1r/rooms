import '../styles/globals.css'
import React, { useState, useEffect } from 'react';
import Header from '../components/header';
import { AuthStates } from '../contexts/authstates';
import router from 'next/router';
function MyApp({ Component, pageProps }) {
	let [authenticated, setAuthenticated] = useState(false);
	let [in_room, setInRoom] = useState(false);
	let [loaded, setLoaded] = useState(false);
	useEffect(() => {
		console.log('_app useeffect here');
		let controller = new AbortController();
		let timeoutID = setTimeout(() => { 
			router.push('/');
			controller.abort(); 
			console.log('timeout function called; cannot authenticate'); 
		}, 5000);
		fetch('api/authenticate', {
			method: 'POST',
			signal: controller.signal
		}).then(async (res) => {
			clearTimeout(timeoutID);
			if (res.status == 200) {
				console.log('_app rerendered');
				setAuthenticated(true);
				setLoaded(true);
			}
		}).catch((err) => console.error(err));
	}, []);
	return (
		<AuthStates.Provider value={{
			authenticated: authenticated,
			in_room: in_room,
			setAuthenticated: (state) => setAuthenticated(state),
			setInRoom: (state) => setInRoom(state)
		}}>
			<div className='h-screen'>
				{	loaded ?
						<Component {...pageProps} />
					:
					null
				}
			</div>
		</AuthStates.Provider>
	)
}

export default MyApp
