import { useEffect, useState, ReactElement } from 'react';
import Link from 'next/link';

function DirectMsgs(): ReactElement {
	return (
		<div className=''>
			<div className='text-2xl'>direct msgs</div>
		</div>
	);
}

function FriendRequests(): ReactElement {
	return (
		<div></div>
	);
}

function FriendsList(props: { friends: Array<string> }) {
	let [filter, setFilter] = useState('');

	return (
		<div className='h-4/5 w-1/2 flex flex-col items-center'>
			<div className=' text-2xl'>
				friends
			</div>
			<input 
				className='outline-none p-1 rounded-sm m-1 text-black' 
				type='text' 
				onChange={(e) => setFilter(e.target.value)} 
				value={filter} 
				placeholder='filter names'/>
			<ul className='text-center rounded-sm mt-1 w-full'>
				{ 
					filter.length === 0 ? 
					props.friends.map((f, index) => 
						<li key={index} className='w-full'>
							<Link href={`user/${f}`}>
								<a className='underline'>{f}</a>
							</Link>
						</li>
					) 
						: 
					props.friends.filter((f: string) => f.includes(filter)) 
				}
			</ul>
		</div>
	);
}

export default function Profile() {
	let [username, setUsername]: [string, React.Dispatch<React.SetStateAction<string>>] = useState('');
	let [bio, setBio]: [string, React.Dispatch<React.SetStateAction<string>>] = useState('');
	let [textAreaValue, setTextArea]: [string, React.Dispatch<React.SetStateAction<string>>] = useState('');
	let [editMode, setEditMode]: [boolean, React.Dispatch<React.SetStateAction<boolean>>] = useState(Boolean(false));
	let [friends, setFriends] = useState([]);
	useEffect(() => {
		let controller = new AbortController();
		let timeoutid = setTimeout(() => controller.abort(), 5000);

		fetch('api/userinfo', {
			method: 'POST',
			signal: controller.signal
		}).then(async (res) => {
			clearTimeout(timeoutid);
			let { username, bio } = await res.json();
			setUsername(username);
			setBio(bio);
		});

		fetch('api/getusers', {
			method: 'POST',
			body: JSON.stringify({
				querytype: 'friends'
			}),
			signal: controller.signal
		}).then(async (res) => {
			let { buddies } = await res.json();
			setFriends(buddies);
		});
	}, []);
	let editprofile = () => {
		if (editMode === false) {
			setEditMode(true);
			setTextArea(bio);
		}
		else {
			let controller = new AbortController();
			let timeoutid = setTimeout(() => controller.abort(), 5000);
			fetch('api/editprofile', {
				method: 'POST',
				body: JSON.stringify({
					bio: textAreaValue
				}),
				signal: controller.signal
			}).then(res => {
				clearTimeout(timeoutid);
				setBio(textAreaValue);
				setEditMode(false);
			});
		}
	};
	return (
		<div className='text-white bg-black h-full flex flex-col items-center justify-center'>
			<Link href='/home'>
				<a className='rounded bg-white text-black p-2 hover:underline'>Home</a>
			</Link>
			<div className=' h-5/6 w-1/2 rounded-sm flex flex-col'>
				<div className='text-center flex justify-center m-1'>
					<div className='w-1/2 border border-black text-2xl font-bold'>
						{username}
					</div>
				</div>
				<div className='flex justify-center items-center break-words'>
					{
						editMode === false ? 
						bio : 
						<textarea 
							className='
								text-black
								resize-none 
								p-1 
								outline-none
								rounded' 
							onChange={(e) => setTextArea(e.target.value)} 
							rows={10} 
							cols={50} 
							value={textAreaValue}>
							{textAreaValue}
						</textarea>
					}
				</div>
				<div className='flex justify-center'>
					<button 
						className='
							p-2 
							bg-white 
							text-black
							m-1 
							rounded 
							hover:underline' 
						onClick={editprofile}>
						{editMode === false ? 'edit profile':'submit'}
					</button>
					{ 
						editMode ? 
						<button 
							className='bg-white text-black p-2 m-1 hover:underline rounded' 
							onClick={() => setEditMode(false)}>
							cancel
						</button>
						:
						null
					}
				</div>
				<div className='flex justify-center'>
					<FriendsList friends={friends}/>
				</div>
			</div>
		</div>
	);
};
