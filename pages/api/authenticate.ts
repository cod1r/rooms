import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
export default function authenticate(req : NextApiRequest, res : NextApiResponse) {
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
		res.statusCode = 200;
		res.send();
	});
}
