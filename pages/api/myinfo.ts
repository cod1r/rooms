import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { pool } from '../../database/databaseinit';

export default function myinfo(req: NextApiRequest, res: NextApiResponse) {
	let token = req.cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.error(err);
			res.statusCode = 500;
			res.send({});
			return;
		}
		pool.query(
			'SELECT USERNAME, BIO FROM Users WHERE USERNAME = ?; SELECT USERNAME FROM Users WHERE ID IN (SELECT FriendID FROM Friends WHERE USERID = (SELECT ID FROM Users WHERE USERNAME = ?))',
			[decoded.username, decoded.username],
			(err, results, fields) => {
				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.send({});
					return;
				}
				res.statusCode = 200;
				res.send({
					username: results[0][0]['USERNAME'],
					bio: results[0][0]['BIO']?.toString('utf8'),
					friends: results[1].map((result) => result['USERNAME']),
				});
			}
		);
	});
}
