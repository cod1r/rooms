import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../database/databaseinit'
import bcrypt from 'bcrypt';
export default function register(req : NextApiRequest, res : NextApiResponse) {
	let str_query = 'INSERT INTO Users (email, username, password) VALUES (?, ?, ?)';
	let credentials = JSON.parse(req.body);
	bcrypt.hash(credentials.password, 10, (err, hash) => {
		query(str_query, [credentials.email, credentials.username, hash]);
	});
	res.statusCode = 200;
	res.send();
}
