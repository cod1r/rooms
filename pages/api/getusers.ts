import {NextApiRequest, NextApiResponse} from "next";
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';

export default function friends(req: NextApiRequest, res: NextApiResponse) {
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	let body = JSON.parse(req.body);
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.log(err);
			return;
		}
		if (body.querytype === 'search') {
			pool.query('SELECT USERNAME FROM USERS WHERE USERNAME LIKE ?', 
				['%' + body.search + '%'], (err, results, fields) => {
					if (err) {
						console.log(err);
						return;
					}
					res.send({ buddies: results.map(res => res['USERNAME']) });
			});
		}
		else if (body.querytype === 'friends') {
			pool.query('SELECT USERNAME FROM USERS WHERE ID = (SELECT FriendID FROM Friends WHERE USERID = (SELECT ID FROM USERS WHERE USERNAME = ?))', 
				[decoded.username], (err, results, fields) => {
					if (err) {
						console.log(err);
						return;
					}
					res.send({ buddies: results.map(res => res['USERNAME']) });
			});
		}
	});
}
