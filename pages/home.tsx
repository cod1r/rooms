import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Link from 'next/link';

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
					props.friends?.map((f, index) => 
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
	let [username, setUsername]: [string, Dispatch<SetStateAction<string>>] = useState('');
	let [bio, setBio]: [string, Dispatch<SetStateAction<string>>] = useState('');
	let [textAreaValue, setTextArea]: [string, Dispatch<SetStateAction<string>>] = useState('');
	let [editMode, setEditMode]: [boolean, Dispatch<SetStateAction<boolean>>] = useState(Boolean(false));
	let [friends, setFriends] = useState([]);
	useEffect(() => {
		let controller = new AbortController();
		let timeoutid = setTimeout(() => controller.abort(), 5000);

		fetch('/api/myinfo', {
			method: 'POST',
			signal: controller.signal
		}).then(async (res) => {
			clearTimeout(timeoutid);
			let { username, bio, friends } = await res.json();
			setFriends(friends);
			setUsername(username);
			setBio(bio);
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
			fetch('/api/editprofile', {
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
		<div 
			className='text-white bg-cyan-600 h-full flex flex-col items-center justify-center'>
			<div 
				className=' h-5/6 w-1/2 rounded-sm flex flex-col items-center'>
				<Link href='/inbox'>
					<a className='underline'>inbox</a>
				</Link>
				<Link href={`/${username}/room/${username}'s room`}>
					<a className='underline'>join my room</a>
				</Link>
				<div 
					className='text-2xl font-bold text-center flex justify-center m-1'>
					{username}
				</div>
				<div className='break-words w-full md:w-1/2 text-center border-2 border-cyan-800 rounded'>
					{
						editMode === false ? 
						bio 
						: 
						<textarea 
							className='
								text-black
								resize-none 
								p-1 
								outline-none
								rounded' 
							onChange={(e) => setTextArea(e.target.value)} 
							maxLength={200}
							value={textAreaValue}>
							{textAreaValue}
						</textarea>
					}
				</div>
				<div className='flex justify-center'>
					<button 
						className='
							p-1 
							bg-white 
							text-black
							m-1 
							rounded 
							hover:underline' 
						onClick={editprofile}>
						{editMode === false ? 'edit bio':'submit'}
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
