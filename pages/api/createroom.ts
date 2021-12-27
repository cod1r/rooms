import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';

export default function createroom(req : NextApiRequest, res : NextApiResponse) {
	// TODO: implement the feature to name custom rooms for users that
	// pay a premium price
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.log(err);
			res.statusCode = 500;
			res.send({});
			return;
		}
		// assuming passwords hash to a unique value
		// otherwise we need to put email into the jwt token
		pool.getConnection((err, connection) => {
			if (err) {
				connection.release();
				console.log(err);
				res.statusCode = 500;
				res.send({});
				return;
			}
			connection.query(
				'INSERT INTO Rooms (RoomName) VALUES(?)', 
				[decoded.username + '\'s room'], 
				(err, results, fields) => {
					if (err) {
						try {
							connection.release();
						}
						catch (e) {
							console.error('bro', e);
						}
						console.log(err);
						res.statusCode = 500;
						res.send({});
						return;
					}
					res.statusCode = 200;
					res.send({roomname: decoded.username + '\'s room'});
				}
			);
			try {
				connection.release();
			}
			catch (e) {
				console.error('bro', e);
			}
		});
	});
}
