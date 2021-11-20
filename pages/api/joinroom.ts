import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';
export default function joinroom(req: NextApiRequest, res: NextApiResponse) {
	console.log('joinroom api called');
	if ('cookie' in req.headers) {
		let room_info = JSON.parse(req.body);
		let cookies = req.headers['cookie'].split(';');
		// we should have one cookie as of right now
		let token = '';
		let first_equal_sign = false;
		for (let character of cookies[0]) {
			if (character == '=' && !first_equal_sign) {
				first_equal_sign = true;
			}
			else if (first_equal_sign) {
				token += character;
			}
		}
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
					connection.query('SELECT PEERID FROM PersonInRoom WHERE ROOMNAME = ?', [room_info['roomname']], (err, results, fields) => {
						if (err) {
							console.log(err);
							return;
						}
						res.statusCode = 200;
						res.send({peers: results.map(result => result['PEERID'])});
					});
				});
				connection.release();
			});
		});
	}
}
