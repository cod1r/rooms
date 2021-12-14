import { useEffect, useState } from 'react';

interface ViewProfileProps {
	friends: Array<string>
	close: () => void
	viewFriend: string
}

export default function ViewProfile(props: ViewProfileProps) {
	let [username, setUsername] = useState('');
	let [description, setDescription] = useState('');

	let addFriend = () => {
	};

	useEffect(() => {
		setUsername(props.viewFriend);
	}, []);

	return (
		<div className='absolute left-0 top-0 h-full w-full grid place-items-center' onClick={props.close}>
			<div className='absolute bg-white rounded-sm h-1/2 w-1/3' onClick={(e) => e.stopPropagation()}>
				<div>{username}</div>
				<div>{description}</div>
				{
					props.friends.includes(username) ? null : <button onClick={addFriend}>Add friend</button>
				}
			</div>
		</div>
	);
}
