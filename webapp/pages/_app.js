import '../styles/globals.css'
function Header() {
	return (
		<div className='text-center'>
			<h1 className='text-xl'>University of Houston Audio Rooms</h1>
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
