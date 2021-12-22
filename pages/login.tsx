import { useState, useContext } from 'react';
import { GLOBALS } from '../contexts/globals';
import router from 'next/router';
export default function Login() {
	let [username, setUsername] = useState('');
	let [password, setPassword] = useState('');
	let glbl = useContext(GLOBALS);
	let submitHandler = (e) => {
		e.preventDefault();
		fetch('/api/login', {
			method: 'POST',
			body: JSON.stringify({
				username: username, 
				password: password 
			})
		}).then(async (res) => {
			if (res.status == 200) {
				glbl.setAuthenticated(true);
				router.push('/home');
			}
		});
	};
	return (
		<div className='h-full w-full grid place-items-center'>
			<form className='w-full grid place-items-center'>
				<label className='w-full md:w-1/2 flex flex-col items-center'>
					<div className='md:text-2xl'>Username</div>
					<input 
						className='outline-none w-1/2 rounded-sm p-3 m-2' 
						type='text' 
						placeholder='Username' 
						name='username'
						value={username}
						onChange={(e) => setUsername(e.target.value)}/>
				</label>
				<label className='w-full md:w-1/2 flex flex-col items-center'>
					<div className='md:text-2xl'>Password</div>
					<input 
						className='outline-none w-1/2 rounded-sm p-3 m-2' 
						type='password' 
						placeholder='Password' 
						name='password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}/>
				</label>
				<div>
					<button 
						className='-4 p-1 rounded-sm' 
						onClick={submitHandler}>
						<div className=' text-white hover:underline md:text-2xl'>Submit</div>
					</button>
				</div>
			</form>
		</div>
	);
}
