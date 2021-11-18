import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { pool } from '../../database/databaseinit';
export default function authenticate(req : NextApiRequest, res : NextApiResponse) {
	if ('cookie' in req.headers) {
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
			}
			// maybe check if the password and username is in the database but for now we will just send a 200 status code
			console.log('decoded', decoded);
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
		console.log('req headers:', req.headers);
	}
}
