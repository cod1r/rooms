import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../database/databaseinit'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export default function register(req : NextApiRequest, res : NextApiResponse) {
	let str_query = 'INSERT INTO Users (email, username, password) VALUES (?, ?, ?)';
	let credentials = JSON.parse(req.body);
	bcrypt.hash(credentials.password, 10, (err, hash) => {
		query(str_query, [credentials.email, credentials.username, hash]).then((result) => {
			if (result) {
				res.statusCode = 200;
				jwt.sign(
					{ username: credentials.username, password: hash }, 
					process.env.private_key, 
					(err, token) => {
						if (err) {
							console.log(err);
						}
						res.setHeader('Set-Cookie', `rememberme=${token}; Max-Age=${60*60*24*365}`);
						res.send();
					}
				);
			}
		});
	});
}
