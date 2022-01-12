import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '../../database/databaseinit';

export default function userinfo(req: NextApiRequest, res: NextApiResponse) {
	let body = JSON.parse(req.body);
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		res.send({
			username: results[0][0]['USERNAME'],
			bio: results[0][0]['BIO']?.toString('utf8'),
			isFriend: results[1][0]['COUNT(USERNAME)'] === 1
				|| body.username === decoded.username,
		});
	});
}
