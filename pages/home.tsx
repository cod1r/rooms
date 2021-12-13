import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { GLOBALS } from '../contexts/globals';
import CreateRoomForm from '../components/createroomform';
import ViewProfile from '../components/viewprofile';
import Search from '../components/search';

function FriendsList() {
	let [friends, setFriends] = useState([]);
	let [filter, setFilter] = useState('');
	let [friendModal, setFriendModal] = useState(false);

	useEffect(() => {
		let controller = new AbortController();
		fetch('/api/friends', {
			method: 'POST',
			signal: controller.signal
		}).then(async (res) => {
			let { buddies } = await res.json();
			setFriends(buddies);
		});
	}, []);

	return (
		<div className='h-4/5 w-1/2 flex flex-col items-center'>
			{
				friendModal ? <ViewProfile friends={friends} /> : null
			}
			<input className='p-1 rounded-sm m-1' type='text' onChange={(e) => setFilter(e.target.value)} value={filter} placeholder='filter names'/>
			<ul className='text-white italic rounded-sm mt-1 w-full'>
				{ 
					filter.length === 0 ? 
					friends.map((f, index) => 
						<li key={index} className='w-full'>
							<button onClick={() => setFriendModal(!friendModal)} className='hover:underline'>
								{f}
							</button>
						</li>
					) 
						: 
					friends.filter(f => f.includes(filter)) 
				}
			</ul>
		</div>
	);
}

function SearchWrapper() {
	return (
		<div className=''>
			<Search />
		</div>
	);
}
// maybe just show top public rooms
function PublicRooms() {
	return (
		<div className=''>
		</div>
	);
}

function DirectMsgs() {
	return (
		<div className=''>
		</div>
	);
}

function FriendRequests() {
	return (
		<div></div>
	);
}

export default function Home() {
	let [MenuIndex, setMenuIndex] = useState(1);
	let MenuOptions = {
		1: <FriendsList/>, 
		2: <CreateRoomForm/>,
		3: <SearchWrapper/>, 
		4: <PublicRooms/>, 
		5: <DirectMsgs/>,
		6: <FriendRequests/>
	};
	return (
		<div className='h-full bg-black grid place-items-center'>
			<div className='rounded-md h-5/6 w-5/6 flex flex-col items-center'>
				<div>
					<select 
						onChange={(e) => setMenuIndex(parseInt(e.target.value))}
						className='text-center p-1 rounded-sm'
						defaultValue="Friends List">
						<option value="1">Friends List</option>
						<option value="2">Create a room</option>
						<option value="3">Search for room/user</option>
						<option value="4">Public Rooms</option>
						<option value="5">Direct Messages</option>
						<option value="6">Friend Requests</option>
					</select>
				</div>
				<div className='h-full w-full flex justify-center'>
					{ MenuOptions[MenuIndex] }
				</div>
			</div>
		</div>
	);
}
