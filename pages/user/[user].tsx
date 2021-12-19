import Link from 'next/link';
import router from 'next/router';
import { useEffect, useState } from 'react';
export default function User() {
	let [username, setUsername] = useState('');
	let [bio, setBio] = useState('');
	useEffect(() => {
		let { user } = router.query;
		// @ts-ignore
		setUsername(user);
		let controller = new AbortController();
		let to = setTimeout(() => controller.abort(), 5000);
		fetch('api/userinfo', {
			method: 'POST',
			body: JSON.stringify({
				username: user
			}),
			signal: controller.signal
			}).then(async (res) => {
				clearTimeout(to);
				let { bio } = await res.json();
				setBio(bio);
			});
	}, []);
	return (
		<div 
			className='bg-black h-full flex flex-col items-center justify-center'>
			<Link href='/home'>
				<a className='text-white hover:underline italic'>Home</a>
			</Link>
			<div className='h-5/6 w-1/2'>
				<div className='text-center flex justify-center m-1'>
					<div className='w-1/2 border border-black text-2xl font-bold text-white'>
						{username}
					</div>
				</div>
				<div className='text-white text-center break-words'>{bio}</div>
			{
				/*
				 * TODO: add a way to add this user as a friend
				<div>
					<button 
						onClick={}>
						request to add as friend
					</button>
				</div>
				 */
			}
			</div>
		</div>
	);
}
