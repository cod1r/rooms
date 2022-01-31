import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { GLOBALS } from '../contexts/globals';
import { getStringLength } from '../utils/utils';
export default function Register() {
	let router = useRouter();
	let [username, setUsername] = useState('');
	let [password, setPassword] = useState('');
	let [email, setEmail] = useState('');
	let [errorMsg, setError] = useState('');
	let glbl = useContext(GLOBALS);
	
	useEffect(() => {
		if (glbl.authenticated) {
			router.push('/home');
		}
	}, [glbl.authenticated]);

	let submitHandler = (e) => {
		e.preventDefault();
		if (getStringLength(username) < 5 || getStringLength(password) < 8) {
			setError('username must be longer than 5 characters and password must be longer than 8');
			return;
		}
		fetch('/api/register', {
			method: 'POST',
			body: JSON.stringify({
				email: email,
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
			<form className='w-1/2 flex flex-col justify-center items-center md:shadow md:shadow-black rounded max-h-min'>
				<label className='w-full md:w-1/2 flex flex-col items-center'>
					<div className='text-2xl text-center'>Email (not required)</div>
					<input
						className='outline-none rounded p-3 m-2 ring ring-black'
						type='Email'
						placeholder='Email'
						name='Email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</label>
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
					<button className='p-1 rounded-sm' onClick={submitHandler}>
						<div className='hover:underline text-2xl bg-black text-white p-2 m-1 rounded'>Submit</div>
					</button>
				</div>
				<div className='w-full break-words text-center'>{errorMsg}</div>
			</form>
		</div>
	);
}
