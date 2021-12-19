import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';
export default function leaveroom(req: NextApiRequest, res: NextApiResponse) {
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.log(err);
			return;
		}
		let password = decoded.password;
		pool.getConnection((err, connection) => {
			connection.query('SELECT ID FROM USERS WHERE password = ?', [password], (err, results, fields) => {
				if (err) {
					connection.release();
					console.log(err);
					return;
				}
				connection.query('DELETE FROM PERSONINROOM WHERE USERID = ?', [results[0]['ID']], (err, results1, fields) => {
					if (err) {
						connection.release();
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
