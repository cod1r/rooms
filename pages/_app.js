import '../styles/globals.css'
import React, { useState, useEffect } from 'react';
import Header from '../components/header';
import { AuthStates } from '../contexts/authstates';
function MyApp({ Component, pageProps }) {
	let [authenticated, setAuthenticated] = useState(false);
	let [in_room, setInRoom] = useState(false);
	useEffect(() => {
		let controller = new AbortController();
		let timeoutID = setTimeout(() => { 
			controller.abort(); 
			console.log('timeout function called'); 
		}, 5000);
		fetch('api/authenticate', {
			method: 'POST',
			signal: controller.signal
		}).then(async (res) => {
			clearTimeout(timeoutID);
			if (res.status == 200) {
				setAuthenticated(true);
			}
		}).catch((err) => console.error(err));
	}, []);
	return (
		<AuthStates.Provider value={{
			authenticated: authenticated,
			in_room: in_room,
			setAuthenticated: () => setAuthenticated(true),
			setInRoom: () => setInRoom(!in_room)
		}}>
			<div className='h-screen'>
				<Header/>
				<Component {...pageProps} />
			</div>
		</AuthStates.Provider>
	)
}

export default MyApp
