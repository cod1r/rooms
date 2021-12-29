import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { pool } from '../../database/databaseinit';
export default function authenticate(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ('cookie' in req.headers) {
		console.log('cookie present');
		let cookies = req.cookies;
		let token = cookies['rememberme'];
		jwt.verify(token, process.env.private_key, (err, decoded) => {
			if (err) {
				console.log(err);
				return;
			}
			// maybe check if the password and username is in the database but for now we will just send a 200 status code
			pool.query(
				'SELECT password FROM Users WHERE password = ?',
				[decoded.password],
				(err, results, fields) => {
					if (err) {
						console.log(err);
						return;
					}
					if (results.length > 0) {
						res.status(200).json({ authenticated: true });
					} else {
						console.log('results', results);
					}
				}
			);
		});
	} else {
		console.log('no cookie in headers, req headers:', req.headers);
		res.status(401).json({ authenticated: false });
	}
}
