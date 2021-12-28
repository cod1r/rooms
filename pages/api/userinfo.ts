import {NextApiRequest, NextApiResponse} from "next";
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';

export default function userinfo(req: NextApiRequest, res: NextApiResponse) {
	let body = JSON.parse(req.body);
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		pool.query('SELECT USERNAME, BIO FROM Users WHERE USERNAME = ?; SELECT COUNT(USERNAME) FROM Users WHERE ID IN (SELECT FRIENDID FROM Friends WHERE USERID = (SELECT ID from Users where USERNAME = ?)) AND USERNAME = ?', [body.username, body.username, decoded.username], (err, results, fields) => {
			if (err) {
				console.log(err);
				return;
			}
			res.send({
				username: results[0][0]['USERNAME'], 
				bio: results[0][0]['BIO']?.toString('utf8'),
				isFriend: results[1][0]['COUNT(USERNAME)'] === 1
			});
		});
	});
}
