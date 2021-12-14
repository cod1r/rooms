import {NextApiRequest, NextApiResponse} from "next";
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';

export default function friends(req: NextApiRequest, res: NextApiResponse) {
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.log(err);
			return;
		}
		pool.query('SELECT USERNAME FROM USERS WHERE ID = (SELECT FriendID FROM Friends WHERE USERID = (SELECT ID FROM USERS WHERE USERNAME = ?))', 
			[decoded.username], (err, results, fields) => {
				if (err) {
					console.log(err);
					return;
				}
				res.send({ buddies: results.map(res => res['USERNAME']) });
		});
	});
}
