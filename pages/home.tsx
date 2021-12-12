import { useState, useContext } from 'react';
import { GLOBALS } from '../contexts/globals';
import CreateRoomForm from '../components/createroomform';
import Search from '../components/search';

function FriendsList() {
	let [friends, setFriends] = useState(['hi', 'bye']);
	return (
		<div className='h-4/5 w-1/2'>
			<ul className='bg-white rounded-sm mt-1'>
				{friends.map((f, index) => <li key={index}>{f}</li>)}
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

export default function Home() {
	let [MenuIndex, setMenuIndex] = useState(1);
	let MenuOptions = {
		1: <FriendsList/>, 
		2: <CreateRoomForm/>,
		3: <SearchWrapper/>, 
		4: <PublicRooms/>, 
		5: <DirectMsgs/>
	};
	return (
		<div className='h-full bg-gradient-to-br from-blue-400 to-green-400 grid place-items-center'>
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
					</select>
				</div>
				<div className='h-full w-full flex justify-center'>
					{ MenuOptions[MenuIndex] }
				</div>
			</div>
		</div>
	);
}
