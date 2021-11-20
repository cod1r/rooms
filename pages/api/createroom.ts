import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
export default function createroom(req : NextApiRequest, res : NextApiResponse) {
	let room_info = JSON.parse(req.body);
	let cookies = cookie.parse(req.headers['cookie']);
	let token = cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.log(err);
		}
		// assuming passwords hash to a unique value
		// otherwise we need to put email into the jwt token
		pool.query('INSERT INTO ROOMS (RoomName) VALUES(?)', [room_info['roomname']], (err, results, fields) => {
			if (err) {
				console.log(err);
				return;
			}
			res.statusCode = 200;
			res.send();
		});
	});
}
