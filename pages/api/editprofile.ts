import {NextApiRequest, NextApiResponse} from "next";
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';

export default function editprofile(req: NextApiRequest, res: NextApiResponse) {
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	let body = JSON.parse(req.body);
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.log(err);
			return;
		}
		pool.query('UPDATE Users SET BIO = ? WHERE USERNAME = ?', [body.bio, decoded.username], (err, results, fields) => {
			if (err) {
				console.log(err);
				return;
			}
			res.statusCode = 200;
			res.send({});
		});
	});
}
