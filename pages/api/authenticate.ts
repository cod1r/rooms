import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { pool } from '../../database/databaseinit';
export default function authenticate(req : NextApiRequest, res : NextApiResponse) {
	console.log('auth api called');
	if ('cookie' in req.headers) {
		let cookies = cookie.parse(req.headers['cookie']);
		let token = cookies['rememberme'];
		jwt.verify(token, process.env.private_key, (err, decoded) => {
			if (err) {
				console.log(err);
			}
			// maybe check if the password and username is in the database but for now we will just send a 200 status code
			pool.query('SELECT password FROM USERS WHERE password = ?', [decoded.password], (err, results, fields) => {
				if (err) {
					console.log(err);
					return;
				}
				if (results.length > 0) {
					res.statusCode = 200;
					res.send();
				}
				else {
					console.log('results', results);
				}
			});
		});
	}
	else {
		console.log('no cookie in headers, req headers:', req.headers);
		res.statusCode = 401;
		res.send();
	}
}
