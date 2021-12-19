import {NextApiRequest, NextApiResponse} from "next";
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';

export default function userinfo(req: NextApiRequest, res: NextApiResponse) {
	let body = req.body.length > 0 ? JSON.parse(req.body) : {};
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		pool.query('SELECT USERNAME, BIO FROM Users WHERE USERNAME = ?', ['username' in body ? body.username : decoded.username], (err, results, fields) => {
			if (err) {
				console.log(err);
				return;
			}
			res.send({username: results[0]['USERNAME']?.toString('utf8'), bio: results[0]['BIO']?.toString('utf8')});
		});
	});
}
