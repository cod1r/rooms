import { useState, useEffect, useContext } from 'react';
import router from 'next/router';
import { AuthStates } from '../contexts/authstates';
interface AuthProps {
	close: () => void,
	register_or_login: string
}
export default function Auth(props : AuthProps) {
	let authstates = useContext(AuthStates);
	let [username, setUsername] = useState('');
	let [password, setPassword] = useState('');
	let [email, setEmail] = useState('');
	let controller = new AbortController();
	let submitHandler = (e) => {
		e.preventDefault();
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
				// use router to push somewhere
				console.log('authentication request status is 200');
				authstates.setAuthenticated();
				props.close();
			}
		});
		setTimeout(() => controller.abort(), 5000);
	}
	let email_label = 
					(<label>
						<div>Email</div>
						<input 
							className='shadow-md focus:ring-2 focus:ring-red-400 w-1/2 rounded-lg outline-none p-3 m-2' 
							type='email' 
							placeholder='Email' 
							name='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}/>
					</label>);
	return (
		<div className='absolute top-0 left-0 bg-black bg-opacity-50 h-screen w-full' onMouseDown={() => props.close()}>
			<div className='relative h-1/2 w-1/3 bg-white top-1/4 left-1/3 rounded-lg flex items-center justify-center' onMouseDown={(e) => e.stopPropagation()}>
				<form className='w-full'>
					{ props.register_or_login == 'register' ? email_label : null}
					<label className=''>
						<div className=''>Username</div>
						<input 
							className='shadow-md focus:ring-2 focus:ring-red-400 w-1/2 rounded-lg outline-none p-3 m-2' 
							type='text' 
							placeholder='Username' 
							name='username'
							value={username}
							onChange={(e) => setUsername(e.target.value)}/>
					</label>
					<label className=''>
						<div className=''>Password</div>
						<input 
							className='shadow-md focus:ring-2 focus:ring-red-400 w-1/2 rounded-lg outline-none p-3 m-2' 
							type='password' 
							placeholder='Password' 
							name='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}/>
					</label>
					<div>
						<button 
							className='h-1/2 w-1/4 p-2 rounded-lg bg-red-600' 
							onClick={submitHandler}>
							<div className='font-bold text-white'>Submit</div>
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
