import Link from 'next/link';
import router from 'next/router';
import { useEffect, useState } from 'react';
export default function User() {
	let [username, setUsername] = useState('');
	let [bio, setBio] = useState('');
	let [isFriend, setIsFriend] = useState(null);
	let [requested, setRequested] = useState(false);
	useEffect(() => {
		let { user } = router.query;
		// @ts-ignore
		setUsername(user);
		let controller = new AbortController();
		let to = setTimeout(() => controller.abort(), 5000);
		fetch('/api/userinfo', {
			method: 'POST',
			body: JSON.stringify({
				username: user,
			}),
			signal: controller.signal,
		}).then(async (res) => {
			clearTimeout(to);
			let { bio, isFriend } = await res.json();
			setIsFriend(isFriend);
			setBio(bio);
		});
	}, []);

	let requestFriend = () => {
		fetch('/api/friend', {
			method: 'POST',
			body: JSON.stringify({
				type: 'request',
				username: username,
			}),
		}).then((res) => {
			if (res.status === 200) {
				setRequested(true);
			}
		});
	};

	return (
		<div className="text-white bg-cyan-600 h-full flex flex-col items-center justify-center">
			<div className="h-5/6 w-1/2 rounded flex flex-col items-center">
				<div className="text-center flex justify-center m-1 text-2xl">
					{username}
				</div>
				<div className="border-2 border-cyan-800 text-center break-words w-full md:w-1/4 rounded">
					{bio}
				</div>
				{(() => {
					if (isFriend === true) {
						return (
							<div>
								<Link href={`/${username}/room/${username}'s room`}>
									<a className="underline">{`join ${username}'s room`}</a>
								</Link>
							</div>
						);
					} else if (isFriend === false) {
						return (
							<div>
								{!requested ? (
									<button onClick={requestFriend} className="underline">
										request to add as friend
									</button>
								) : null}
							</div>
						);
					} else {
						return 'Loading...';
					}
				})()}
			</div>
		</div>
	);
}
