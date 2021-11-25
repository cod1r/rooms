import { useState, useEffect, useContext } from 'react';
import router from 'next/router';
import { GLOBALS } from '../contexts/globals';
interface AuthProps {
	close: () => void,
	register_or_login: string
}
export default function Auth(props : AuthProps) {
	let glbl = useContext(GLOBALS);
	let [username, setUsername] = useState('');
	let [password, setPassword] = useState('');
	let [email, setEmail] = useState('');
	let controller = new AbortController();
	let submitHandler = (e) => {
		e.preventDefault();
		let controller = new AbortController();
		let timeoutId = setTimeout(() => controller.abort(), 5000);
		fetch(props.register_or_login == 'register' ? '/api/register' : '/api/login', {
			method: 'POST',
			body: JSON.stringify(
				props.register_or_login == 'register' ? {
					email: email,
					username: username,
					password: password
				} : { 
					username: username, 
					password: password 
				}
			),
			signal: controller.signal
		}).then(async (res) => {
			if (res.status == 200) {
				clearTimeout(timeoutId);
				// use router to push somewhere
				console.log('authentication request status is 200');
				glbl.setAuthenticated(true);
				props.close();
			}
		});
	}
	let email_label = 
					(<label>
						<div>Email</div>
						<input 
							className='border border-solid border-green-400 w-1/2 rounded-sm outline-none p-3 m-2' 
							type='email' 
							placeholder='Email' 
							name='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}/>
					</label>);
	return (
		<div className='absolute top-0 left-0 bg-black bg-opacity-50 h-screen w-full' onMouseDown={() => props.close()}>
			<div className='relative h-1/2 w-1/3 bg-white top-1/4 left-1/3 rounded-sm flex items-center justify-center' onMouseDown={(e) => e.stopPropagation()}>
				<form className='relative z-10 w-full grid place-items-center'>
					<div className='text-center w-full'>
						{ props.register_or_login == 'register' ? email_label : null}
						<label className=''>
							<div className=''>Username</div>
							<input 
								className='border border-solid border-green-400 w-1/2 rounded-sm outline-none p-3 m-2' 
								type='text' 
								placeholder='Username' 
								name='username'
								value={username}
								onChange={(e) => setUsername(e.target.value)}/>
						</label>
						<label className=''>
							<div className=''>Password</div>
							<input 
								className='border border-solid border-green-400 w-1/2 rounded-sm outline-none p-3 m-2' 
								type='password' 
								placeholder='Password' 
								name='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}/>
						</label>
						<div>
							<button 
								className='p-2 rounded-sm bg-green-400' 
								onClick={submitHandler}>
								<div className='font-bold text-white'>Submit</div>
							</button>
						</div>
					</div>
				</form>
				<button 
					className='absolute top-0 right-0 left-4/5 bottom-4/5 m-1 z-20 rounded-sm bg-green-400 text-white p-1 font-bold' 
					onClick={() => props.close()}>close</button>
			</div>
		</div>
	);
}
