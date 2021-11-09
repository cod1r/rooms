import '../styles/globals.css'
import { useState, useEffect } from 'react';
import Header from '../components/header';
import Auth from '../components/user_auth'
function MyApp({ Component, pageProps }) {
	return (
		<div className='h-screen'>
			<Header/>
			<Component {...pageProps} />
		</div>
	)
}

export default MyApp
