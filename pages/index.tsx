import React, { useEffect, useState, useRef } from 'react'

export default function Home() {
	let controller = new AbortController();
	useEffect(() => {
		setTimeout(() => {
			controller.abort();
		}, 5000);
		fetch('api/authenticate', {
			method: 'POST',
			signal: controller.signal
		}).then((res) => {
			if (res.status == 200) {
			}
		});
	}, []);
	return (
		<div className=''>
		</div>
	)
}
