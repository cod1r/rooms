import { useState } from 'react';
export default function Register(props) {
	let [username, setUsername] = useState('');
	let [password, setPassword] = useState('');
	let [email, setEmail] = useState('');
	let submitHandler = (e) => {
		e.preventDefault();
		fetch('/api/register', {
			method: 'POST',
			body: JSON.stringify({
				email: email,
				username: username,
				password: password
			})
		}).then(async (res) => {
			console.log(res);
		});
	}
	return (
		<div className='absolute top-0 left-0 bg-black bg-opacity-50 h-full w-full' onMouseDown={() => props.close()}>
			<div className='relative h-1/2 w-1/3 bg-white top-1/4 left-1/3 rounded-lg flex items-center justify-center' onMouseDown={(e) => e.stopPropagation()}>
				<form className='w-full'>
					<label>
						<div>Email</div>
						<input 
							className='shadow-md focus:ring-2 focus:ring-red-400 w-1/2 rounded-lg outline-none p-3 m-2' 
							type='email' 
							placeholder='Email' 
							name='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}/>
					</label>
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
