import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export default function register(req: NextApiRequest, res: NextApiResponse) {
	let credentials = JSON.parse(req.body);
	bcrypt.hash(credentials.password, 10, (err, hash) => {
		if (err) {
			console.error(err);
			return;
		}
		pool.getConnection((err, connection) => {
			if (err) {
				connection.release();
				console.error(err);
				return;
			}
			connection.query(
				'SELECT COUNT(USERNAME) FROM Users WHERE USERNAME = ?',
				[credentials.username],
				(err, results, fields) => {
					if (err) {
						connection.release();
						console.log(err);
						return;
					}
					// we check if username already exists
					if (results[0]['COUNT(USERNAME)'] === 0) {
						connection.query(
							'INSERT INTO Users (email, username, password) VALUES (?, ?, ?); INSERT INTO Rooms (RoomName, PersonCount) VALUES(?, ?)',
							[
								credentials.email,
								credentials.username,
								hash,
								`${credentials.username}'s room`,
								0,
							],
							(err, results, fields) => {
								if (err) {
									console.log(err);
									return;
								}
								res.statusCode = 200;
								jwt.sign(
									{ username: credentials.username, password: hash },
									process.env.private_key,
									(err, token) => {
										if (err) {
											console.log(err);
											return;
										}
										res.setHeader(
											'Set-Cookie',
											`rememberme=${token}; Max-Age=${60 * 60 * 24 * 365}`
										);
										res.send({});
									}
								);
							}
						);
					} else {
						res.statusCode = 401;
						res.send({});
					}
				}
			);
			connection.release();
		});
	});
}
