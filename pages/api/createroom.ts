import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';

export default function createroom(req : NextApiRequest, res : NextApiResponse) {
	let room_info = JSON.parse(req.body);
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.log(err);
			return;
		}
		// assuming passwords hash to a unique value
		// otherwise we need to put email into the jwt token
		pool.getConnection((err, connection) => {
			if (err) {
				connection.release();
				console.log(err);
				return;
			}
			connection.query('SELECT COUNT(ROOMNAME) FROM Rooms WHERE ROOMNAME = ?', [room_info['roomname']], (err, results, fields) => {
				if (err) {
					connection.release();
					console.log(err);
					return;
				}
				// we only allow people to create a room only if the roomname doesn't already exist
				if (results[0]['COUNT(ROOMNAME)'] === 0) {
					connection.query('INSERT INTO ROOMS (RoomName) VALUES(?)', [room_info['roomname']], (err, results, fields) => {
						if (err) {
							console.log(err);
							return;
						}
						res.statusCode = 200;
						res.send({});
					});
				}
				else {
					res.statusCode = 401;
					res.send({});
				}
			});
			connection.release();
		});
	});
}
