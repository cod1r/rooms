import { useEffect, useState, Dispatch, SetStateAction } from 'react';
import Link from 'next/link';

function FriendsList(props: { friends: Array<string> }) {
	let [filter, setFilter] = useState('');

	return (
		<div className="h-4/5 w-1/2 flex flex-col items-center">
			<div className=" text-2xl">friends</div>
			<input
				className="outline-none p-1 rounded-sm m-1 text-black"
				type="text"
				onChange={(e) => setFilter(e.target.value)}
				value={filter}
				placeholder="filter names"
			/>
			<ul className="text-center rounded-sm mt-1 w-full">
				{filter.length === 0
					? props.friends?.map((f, index) => (
							<li key={index} className="w-full">
								<Link href={`user/${f}`}>
									<a className="underline">{f}</a>
								</Link>
							</li>
					  ))
					: props.friends.filter((f: string) => f.includes(filter))}
			</ul>
		</div>
	);
}

let Results = (props) => {
	return (
		<div>
			<ul>
				{props.results.map((result, index) => (
					<li key={index}>
						<Link href={`/user/${result}`}>
							<a className="underline">{result}</a>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default function Profile() {
	let [username, setUsername]: [string, Dispatch<SetStateAction<string>>] =
		useState('');
	let [bio, setBio]: [string, Dispatch<SetStateAction<string>>] = useState('');
	let [textAreaValue, setTextArea]: [string, Dispatch<SetStateAction<string>>] =
		useState('');
	let [editMode, setEditMode]: [boolean, Dispatch<SetStateAction<boolean>>] =
		useState(Boolean(false));
	let [friends, setFriends] = useState([]);
	let [searching, setSearching] = useState(false);
	let [searchquery, setSearchQuery] = useState('');
	let [searchResults, setSearchResults] = useState([]);
	useEffect(() => {
		let controller = new AbortController();
		let timeoutid = setTimeout(() => controller.abort(), 5000);

		fetch('/api/myinfo', {
			method: 'POST',
			signal: controller.signal,
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
		} else {
			let controller = new AbortController();
			let timeoutid = setTimeout(() => controller.abort(), 5000);
			fetch('/api/editprofile', {
				method: 'POST',
				body: JSON.stringify({
					bio: textAreaValue,
				}),
				signal: controller.signal,
			}).then((res) => {
				clearTimeout(timeoutid);
				setBio(textAreaValue);
				setEditMode(false);
			});
		}
	};

	let searchUsers = () => {
		fetch('/api/search', {
			method: 'POST',
			body: JSON.stringify({
				query: searchquery,
			}),
		}).then(async (res) => {
			if (res.status === 200) {
				let { queryResults } = await res.json();
				setSearchResults(queryResults);
				console.log(queryResults);
			}
		});
	};

	return (
		<div className="text-white bg-cyan-600 h-full flex flex-col items-center justify-center">
			<div className=" h-5/6 w-1/2 rounded-sm flex flex-col items-center">
				<div className="text-2xl font-bold text-center flex justify-center m-1">
					{username}
				</div>
				<Link href="/inbox">
					<a className="underline">inbox</a>
				</Link>
				{username.length > 0 ? (
					<Link href={`/${username}/room/${username}'s room`}>
						<a className="underline">join my room</a>
					</Link>
				) : (
					'...'
				)}
				<div className="flex justify-center">
					<button className="underline m-1" onClick={editprofile}>
						{editMode === false ? 'edit bio' : 'submit'}
					</button>
					{editMode ? (
						<button
							className="underline m-1"
							onClick={() => setEditMode(false)}
						>
							cancel
						</button>
					) : null}
				</div>
				<div className="m-2 break-words w-full md:w-1/4 text-center border-2 border-cyan-800 rounded">
					{editMode === false ? (
						bio
					) : (
						<textarea
							className="
								bg-cyan-600
								resize-none 
								p-1 
								outline-none
								rounded"
							onChange={(e) => setTextArea(e.target.value)}
							maxLength={200}
							autoFocus={true}
							value={textAreaValue}
						>
							{textAreaValue}
						</textarea>
					)}
				</div>
				<div className="flex justify-evenly md:w-1/2 w-full">
					<button
						className="focus:underline"
						onClick={() => setSearching(true)}
					>
						search
					</button>
					<button
						className="focus:underline"
						onClick={() => setSearching(false)}
					>
						friends
					</button>
				</div>
				{searching ? (
					<div className="mt-4 max-w-md">
						<input
							onChange={(e) => setSearchQuery(e.target.value)}
							value={searchquery}
							type="search"
							className="text-black outline-none p-1 rounded"
							placeholder="search for users..."
						/>
						<div className="w-full flex justify-center">
							<button
								onClick={searchUsers}
								className="max-w-prose text-ellipsis bg-white text-black p-1 rounded m-1 hover:underline"
							>
								search
							</button>
						</div>
					</div>
				) : null}
				<div className="flex justify-center">
					{!searching ? (
						<FriendsList friends={friends} />
					) : (
						<Results results={searchResults} />
					)}
				</div>
			</div>
		</div>
	);
}
