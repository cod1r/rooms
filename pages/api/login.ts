import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export default function login(req : NextApiRequest, res : NextApiResponse) {
	let credentials = JSON.parse(req.body);
	pool.query('SELECT password FROM Users WHERE USERNAME = ?', [credentials.username], (err, results, fields) => {
		if (err) {
			console.error(err);
			return;
		}
		results.forEach((element) => { 
			bcrypt.compare(credentials.password, element.password, (err, result) => {
				if (err) {
					console.log(err);
					return;
				}
				res.statusCode = 200;
				jwt.sign(
					{ username: credentials.username, password: element.password }, 
					process.env.private_key, 
					(err, token) => {
						if (err) {
							console.log(err);
						}
						res.setHeader('Set-Cookie', `rememberme=${token}; Max-Age=${60*60*24*365}`);
						res.send({});
					}
				);
			});
		});
	});
}
