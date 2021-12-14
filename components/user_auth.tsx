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
	let [error, setError] = useState('');
	let submitHandler = (e: React.FormEvent) => {
		e.preventDefault();
		if (props.register_or_login === 'register' && (username.length === 0 || password.length < 8)) {
			setError("Either username is empty or password is not long enough");
			return;
		}
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
				console.log('authentication request status is 200');
				glbl.setAuthenticated(true);
				router.push(res.url);
				props.close();
			}
		});
	}
	let email_label = 
					(<label>
						<div>Email <i>(Optional)</i></div>
						<input 
							className='border border-black w-1/2 rounded-sm p-3 m-2' 
							type='email' 
							placeholder='Email' 
							name='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}/>
					</label>);
	return (
		<div className='absolute top-0 left-0 bg-black grid place-items-center bg-opacity-50 h-screen w-full' onMouseDown={() => props.close()}>
			<div className='relative min-h-fit p-2 w-1/4 bg-white rounded-sm flex items-center justify-center' onMouseDown={(e) => e.stopPropagation()}>
				<form className='relative z-10 w-full grid place-items-center'>
					<div className='text-center w-full'>
						{ props.register_or_login == 'register' ? email_label : null}
						<label className=''>
							<div className=''>Username</div>
							<input 
								className='border border-black w-1/2 rounded-sm p-3 m-2' 
								type='text' 
								placeholder='Username' 
								name='username'
								value={username}
								onChange={(e) => setUsername(e.target.value)}/>
						</label>
						<label className=''>
							<div className=''>Password</div>
							<input 
								className='border border-black w-1/2 rounded-sm p-3 m-2' 
								type='password' 
								placeholder='Password' 
								name='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}/>
						</label>
						<div>
							<button 
								className='p-2 rounded-sm bg-black' 
								onClick={submitHandler}>
								<div className='italic text-white'>Submit</div>
							</button>
						</div>
					</div>
					<div className='text-sm break-words w-3/4 text-center'>{error}</div>
				</form>
				<button 
					className='absolute top-0 right-0 left-4/5 bottom-4/5 m-1 z-20 rounded-sm bg-black text-white p-1 italic' 
					onClick={() => props.close()}>close</button>
			</div>
		</div>
	);
}
