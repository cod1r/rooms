import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
// TODO: merge all sql queries into just one big nested SQL query
export default function joinroom(req: NextApiRequest, res: NextApiResponse) {
	console.log('joinroom api called');
	if ('cookie' in req.headers) {
		let room_info = JSON.parse(req.body);
		let cookies = req.cookies;
		let token = cookies['rememberme'];
		jwt.verify(token, process.env.private_key, (err, decoded) => {
			if (err) {
				console.log(err);
				return;
			}
			pool.getConnection((err, connection) => {
				if (err) {
					console.log(err);
					return;
				}
				connection.query('SELECT ID FROM USERS WHERE password = ?', [decoded['password']], (err, results, fields) => {
					if (err) {
						console.log(err);
						return;
					}
					connection.query('DELETE FROM PersonInRoom WHERE USERID = ?', [results[0]['ID']], (err1, results1, fields) => {
						if (err) {
							console.log(err);
							return;
						}
					});
					connection.query('INSERT INTO PersonInRoom (USERID, ROOMNAME, PEERID) VALUES (?, ?, ?)', 
						[results[0]['ID'], room_info['roomname'], room_info['id']], (err, results1, fields) => {
							if (err) {
								console.log(err);
								return;
							}
						});
					connection.query('SELECT USERNAME, PEERID FROM PersonInRoom INNER JOIN USERS ON PersonInRoom.USERID = USERS.ID WHERE ROOMNAME = ?', 
						[room_info['roomname']], 
						(err, results, fields) => {
							if (err) {
								console.log(err);
								return;
							}
							res.statusCode = 200;
							let users = {};
							results.forEach((result) => users[result['USERNAME']] = result['PEERID']);
							res.send(users);
						});
				});
				connection.release();
			});
		});
	}
}
