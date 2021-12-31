import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { pool } from '../../database/databaseinit';

const inbox = (req: NextApiRequest, res: NextApiResponse) => {
	let token = req.cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.error(err);
			res.statusCode = 500;
			res.send({});
			return;
		}
		pool.query(
			`
			SELECT USERNAME from Users WHERE ID IN (
				SELECT RequesterID FROM FriendRequests WHERE RequesteeID = (
					SELECT ID FROM Users WHERE USERNAME = ?
				)
			)
			`,
			[decoded.username],
			(err, results, fields) => {
				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.send({});
					return;
				}
				res.statusCode = 200;
				res.send({
					friendRequests: results.map((result) => result['USERNAME']),
				});
			}
		);
	});
};
export default inbox;
