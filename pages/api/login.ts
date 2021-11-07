import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../database/databaseinit';
import bcrypt from 'bcrypt';
export default function login() {
	let str_query = 'SELECT password FROM USERS WHERE USERNAME = ?';
	let credentials = JSON.parse(req.body);
	let HashedPasswords = query(str_query, [credentials.username]);
	res.status = 401;
	for (hash of HashedPasswords) {
		bcrypt.compare(credentials.password, password, (err, result) => {
			if (result) {
				res.status = 200;
				break;
			}
		});
	}
	res.send();
}
