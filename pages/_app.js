import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { GLOBALS } from '../contexts/globals';
import '../styles/globals.css';
function MyApp({ Component, pageProps }) {
	let router = useRouter();
	let [authenticated, setAuthenticated] = useState(false);
	let [in_room, setInRoom] = useState(false);
	let [loaded, setLoaded] = useState(false);
	let [colorMode, setColorMode] = useState(null);
	let colorRef = useRef();
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
					router.pathname !== '/register'
					&& router.pathname !== '/login'
				) {
					router.push('/');
				}
				setLoaded(true);
			})
			.catch((err) => console.error(err));
	}, []);

	useEffect(() => {
		if (colorMode !== null) {
			localStorage.setItem('colorMode', colorMode);
			// tries both because I don't want to store previous colorMode
			if (colorRef.current.classList.contains('dark') && colorMode === 'light') {
				colorRef.current.classList.remove('dark');
			} else if (colorMode === 'dark') {
				colorRef.current.classList.add('dark');
			}
		} else if (colorMode === null) {
			if (localStorage.getItem('colorMode') === null) {
				setColorMode('light');
				localStorage.setItem('colorMode', 'light');
			} else {
				setColorMode(localStorage.getItem('colorMode'));
			}
		}
	}, [colorMode]);

	return (
		<GLOBALS.Provider
			value={{
				authenticated: authenticated,
				in_room: in_room,
				setAuthenticated: (state) => setAuthenticated(state),
				setInRoom: (state) => setInRoom(state),
				colorMode: colorMode,
				setColorMode: (state) => setColorMode(state),
			}}
		>
			<div ref={colorRef} className='h-screen w-screen'>
				{loaded ? <Component {...pageProps} /> : null}
			</div>
		</GLOBALS.Provider>
	);
}

export default MyApp;
