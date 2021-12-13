import { useEffect, useState } from 'react';

interface ViewProfileProps {
	friends: Array<string>
}

export default function ViewProfile(props: ViewProfileProps) {
	let [username, setUsername] = useState('');
	let [description, setDescription] = useState('');

	let addFriend = () => {
	};

	useEffect(() => {

	}, []);

	return (
		<div>
			<div>{username}</div>
			<div>{description}</div>
			{
				username in props.friends ? null : <button onClick={addFriend}>Add friend</button>
			}
		</div>
	);
}
