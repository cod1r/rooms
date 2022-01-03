import '../styles/globals.css';
import React, { useState, useEffect } from 'react';
import { GLOBALS } from '../contexts/globals';
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
			setLoaded(true);
			controller.abort();
			console.log('timeout function called; cannot authenticate');
		}, 5000);
		fetch('/api/authenticate', {
			method: 'POST',
			signal: controller.signal,
		})
			.then(async (res) => {
				clearTimeout(timeoutID);
				if (res.status === 200) {
					setAuthenticated(true);
					if (router.pathname === '/') {
						await router.push('/home');
					}
				} else if (
					router.pathname !== '/register' &&
					router.pathname !== '/login'
				) {
					router.push('/');
				}
				setLoaded(true);
			})
			.catch((err) => console.error(err));
	}, []);
	return (
		<GLOBALS.Provider
			value={{
				authenticated: authenticated,
				in_room: in_room,
				setAuthenticated: (state) => setAuthenticated(state),
				setInRoom: (state) => setInRoom(state),
			}}
		>
			<div className="h-screen w-screen">
				{loaded ? <Component {...pageProps} /> : null}
			</div>
		</GLOBALS.Provider>
	);
}

export default MyApp;
