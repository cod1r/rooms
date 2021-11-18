import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';
export default function leaveroom(req: NextApiRequest, res: NextApiResponse) {
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
			return;
		}
		let password = decoded.password;
		pool.getConnection((err, connection) => {
			connection.query('SELECT ID FROM USERS WHERE password = ?', [password], (err, results, fields) => {
				if (err) {
					console.log(err);
					return;
				}
				connection.query('DELETE FROM PERSONINROOM WHERE USERID = ?', [results[0]['ID']], (err, results1, fields) => {
					if (err) {
						console.log(err);
						return;
					}
					res.statusCode = 200;
					res.send({});
				});
			});
			connection.release();
		});
	});
}
