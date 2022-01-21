import { useRouter } from 'next/router';
import { useContext, useState, useEffect } from 'react';
import { GLOBALS } from '../contexts/globals';
export default function Login() {
	let router = useRouter();
	let [username, setUsername] = useState('');
	let [password, setPassword] = useState('');
	let [errorMsg, setError] = useState('');
	let glbl = useContext(GLOBALS);
	useEffect(() => {
		if (glbl.authenticated) {
			router.push('/home');
		}
	}, [glbl.authenticated]);
	let submitHandler = (e) => {
		e.preventDefault();
		fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({
				username: username,
				password: password,
			}),
		}).then(async (res) => {
			if (res.status == 200) {
				glbl.setAuthenticated(true);
				router.push('/home');
			} else if (res.status === 401) {
				let { error } = await res.json();
				setError(error);
			}
		});
	};
	return (
		<div className='h-full w-full grid place-items-center'>
			<div className=''>{errorMsg}</div>
			<form className='md:w-1/3 md:h-1/2 flex flex-col justify-center items-center md:shadow md:shadow-black rounded'>
				<label className='w-full md:w-1/2 flex flex-col items-center'>
					<div className='text-2xl'>Username</div>
					<input
						className='outline-none rounded p-3 m-2 ring ring-black'
						type='text'
						placeholder='Username'
						name='username'
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
				</label>
				<label className='w-full md:w-1/2 flex flex-col items-center'>
					<div className='text-2xl'>Password</div>
					<input
						className='outline-none rounded p-3 m-2 ring ring-black'
						type='password'
						placeholder='Password'
						name='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</label>
				<div>
					<button className='-4 p-1 rounded-sm' onClick={submitHandler}>
						<div className='hover:underline text-2xl bg-black text-white p-2 rounded shadow shadow-black'>Submit</div>
					</button>
				</div>
			</form>
		</div>
	);
}
