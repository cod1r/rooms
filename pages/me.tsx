import { useEffect, useRef, useState } from 'react';

export default function Profile() {
	let [username, setUsername]: [string, any] = useState('');
	let [bio, setBio]: [string, any] = useState('');
	let [textAreaValue, setTextArea]: [string, any] = useState('');
	let [editMode, setEditMode]: [boolean, any] = useState(Boolean(false));
	let textAreaRef = useRef(null);

	useEffect(() => {
		let controller = new AbortController();
		let timeoutid = setTimeout(() => controller.abort(), 5000);

		fetch('/api/myinfo', {
			method: 'POST',
			body: JSON.stringify({
				type: 'get',
			}),
			signal: controller.signal,
		}).then(async (res) => {
			clearTimeout(timeoutid);
			let { username, bio } = await res.json();
			setUsername(username);
			setBio(bio);
		});
	}, []);

	let editprofile = () => {
		if (editMode === false) {
			textAreaRef.current.focus();
			console.log(document.activeElement);
			setEditMode(true);
			setTextArea(bio);
		} else {
			let controller = new AbortController();
			let timeoutid = setTimeout(() => controller.abort(), 5000);
			fetch('/api/myinfo', {
				method: 'POST',
				body: JSON.stringify({
					type: 'edit',
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

	return (
		<div className='overflow-y-auto h-full w-full flex flex-col items-center'>
			<div className='text-2xl font-bold text-center flex justify-center m-1'>
				{username}
			</div>
			<div className='w-full md:w-1/3 flex flex-col items-center'>
				<div className='flex justify-center'>
					<button className='bg-black p-2 m-1 text-white rounded shadow shadow-black' onClick={editprofile}>
						{editMode === false ? 'edit bio' : 'submit'}
					</button>
					{editMode
						? (
							<button
								className='bg-black p-2 m-1 text-white rounded shadow shadow-black'
								onClick={() => setEditMode(false)}
							>
								cancel
							</button>
						)
						: null}
				</div>
				<div className='w-full h-48 flex flex-col items-center m-2'>
					<textarea
						ref={textAreaRef}
						className='text-center w-5/6 md:w-full h-full shadow shadow-black resize-none p-1 outline-none rounded'
						onChange={(e) => setTextArea(e.target.value)}
						maxLength={200}
						disabled={!editMode}
						value={textAreaValue}
					>
						{textAreaValue}
					</textarea>
					{editMode ? <div>characters left: {200 - textAreaValue.length}</div> : null}
				</div>
			</div>
			<div className='text-xl font-bold'>Rooms</div>
			<ul></ul>
		</div>
	);
}
