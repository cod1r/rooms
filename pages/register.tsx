import { useState, useContext } from 'react';
import { GLOBALS } from '../contexts/globals';
import router from 'next/router';
export default function Register(props) {
	let [username, setUsername] = useState('');
	let [password, setPassword] = useState('');
	let [email, setEmail] = useState('');
	let glbl = useContext(GLOBALS);
	let submitHandler = () => {
		fetch('/api/register', {
			method: 'POST',
			body: JSON.stringify({
				email: email,
				username: username, 
				password: password 
			})
		}).then(async (res) => {
			if (res.status == 200) {
				glbl.setAuthenticated(true);
				router.push('/home');
				props.close();
			}
		});
	};
	return (
		<div className='h-full w-full grid place-items-center'>
			<form className='w-full grid place-items-center'>
				<label className='w-full md:w-1/2 flex flex-col items-center'>
					<div className='md:text-2xl'>Email (not required)</div>
					<input 
						className='outline-none w-1/2 rounded-sm p-3 m-2' 
						type='Email' 
						placeholder='Email' 
						name='Email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}/>
				</label>
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
						className='p-1 rounded-sm' 
						onClick={submitHandler}>
						<div className=' text-white hover:underline md:text-2xl'>Submit</div>
					</button>
				</div>
			</form>
		</div>
	);
}
