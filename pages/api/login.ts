import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../database/databaseinit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export default function login(req : NextApiRequest, res : NextApiResponse) {
	let str_query = 'SELECT password FROM USERS WHERE USERNAME = ?';
	let credentials = JSON.parse(req.body);
	let cb = (results, obj) => { 
		results.forEach((element) => { 
			obj['bcrypt'].compare(obj['credentials'].password, element.password, (err, result) => {
				if (err) {
					console.log(err);
				}
				else if (result) {
					obj['res'].statusCode = 200;
					obj['jwt'].sign(
						{ username: obj['credentials'].username, password: element.password }, 
						process.env.private_key, 
						(err, token) => {
							if (err) {
								console.log(err);
							}
							obj['res'].setHeader('Set-Cookie', `rememberme=${token}; Max-Age=${60*60*24*365}`);
							obj['res'].send();
						}
					);
					return;
				}
			});
		})
	};
	let parameters = {
		credentials: credentials,
		bcrypt: bcrypt,
		res: res,
		jwt: jwt
	};
	query(str_query, [credentials.username], cb, parameters);
}
