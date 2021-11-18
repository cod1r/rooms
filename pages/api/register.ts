import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export default function register(req : NextApiRequest, res : NextApiResponse) {
	let credentials = JSON.parse(req.body);
	bcrypt.hash(credentials.password, 10, (err, hash) => {
		pool.query('INSERT INTO Users (email, username, password) VALUES (?, ?, ?)', 
								[credentials.email, credentials.username, hash], 
								(err, results, fields) => {
									if (err) {
										console.log(err);
										return;
									}
									if (results) {
										res.statusCode = 200;
										jwt.sign(
											{ username: credentials.username, password: hash }, 
											process.env.private_key, 
											(err, token) => {
												if (err) {
													console.log(err);
													return;
												}
												res.setHeader('Set-Cookie', `rememberme=${token}; Max-Age=${60*60*24*365}`);
												res.send();
											}
										);
									}
								}
		);
	});
}
