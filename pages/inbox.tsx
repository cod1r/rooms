import { useEffect, useState, Dispatch, SetStateAction } from 'react';

const Inbox = () => {
	let [requests, setRequests] = useState([]);
	useEffect(() => {
		fetch('/api/inbox', {
			method: 'POST'
		}).then(async (res) => {
			if (res.status === 200) {
				let { friendRequests } = await res.json();
				setRequests(friendRequests);
			}
		});
	}, []);
	let acceptFriend = (index) => {
		fetch('/api/friend', {
			method: 'POST',
			body: JSON.stringify({
				type: 'accept',
				username: requests[index]
			})
		}).then(async (res) => {
			if (res.status === 200) {
				setRequests(requests.splice(index, 1));
			}
		});
	};
	let declineFriend = (index) => {
		fetch('/api/friend', {
			method: 'POST',
			body: JSON.stringify({
				type: 'reject',
				username: requests[index]
			})
		}).then((res) => {
			if (res.status === 200) {
				setRequests(requests.splice(index, 1));
			}
		});
	};
	return (
		<div className='bg-cyan-600 h-full w-full flex flex-col items-center'>
			<div className='text-center text-white text-2xl'>Inbox</div>
			<div className='text-xl text-center text-white'>friend requests</div>
			<ul className='shadow-md text-center h-full md:h-5/6 border-2 border-cyan-800 w-5/6 md:w-1/2 overflow-y-auto rounded text-white'>
				{
					requests.map((fr, index) => 
					<li key={index} className='p-2 border-t border-cyan-800'>
						<div className='flex justify-evenly'>
							<div>
								{fr}
							</div>
							<div className=''>
								<button onClick={() => acceptFriend(index)} className='pl-2 pr-2 text-black bg-white rounded m-1'>
									accept
								</button>
								<button onClick={() => declineFriend(index)} className='pl-2 pr-2 text-black bg-white rounded m-1'>
									decline
								</button>
							</div>
						</div>
					</li>
					)
				}
			</ul>
		</div>
	);
};

export default Inbox;
