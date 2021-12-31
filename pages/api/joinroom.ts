import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';

interface Body {
	user: string;
	roomname: string;
	id: string;
}

export default function joinroom(req: NextApiRequest, res: NextApiResponse) {
	console.log('joinroom api called');
	if ('cookie' in req.headers) {
		let body: Body = JSON.parse(req.body);
		let cookies = req.cookies;
		let token = cookies['rememberme'];
		jwt.verify(token, process.env.private_key, (err, decoded) => {
			if (err) {
				res.statusCode = 500;
				res.send({});
				console.log(err);
				return;
			}
			pool.getConnection((err, connection) => {
				if (err) {
					try {
						connection.release();
					} catch (e) {
						console.log('after release', e);
					}
					res.statusCode = 500;
					res.send({});
					console.log(err);
					return;
				}
				connection.query(
					`
					SELECT COUNT(USERNAME) FROM Users WHERE ID IN (
						SELECT FriendID FROM Friends WHERE USERID = (
							SELECT ID FROM Users WHERE USERNAME = ?
						)
					) AND USERNAME = ?
					`,
					[body.user, decoded.username],
					(err, results, fields) => {
						if (err) {
							try {
								connection.release();
							} catch (e) {
								console.log('after release', e);
							}
							console.error(err);
							res.statusCode = 500;
							res.send({});
							return;
						}
						if (
							results[0]['COUNT(USERNAME)'] === 1 ||
							body.user === decoded.username
						) {
							connection.query(
								`
								DELETE FROM PersonInRoom WHERE USERID = (SELECT ID FROM Users WHERE password = ?); 
								INSERT INTO PersonInRoom (USERID, ROOMNAME, PEERID) VALUES (
									(SELECT ID FROM Users WHERE password = ?), 
									?,?
								); 
								SELECT PEERID FROM PersonInRoom INNER JOIN Users ON PersonInRoom.USERID = Users.ID WHERE ROOMNAME = ?
								`,
								[
									decoded.password,
									decoded.password,
									body['roomname'],
									body['id'],
									body['roomname'],
								],
								(err, results1, fields) => {
									if (err) {
										try {
											connection.release();
										} catch (e) {
											console.log('after release', e);
										}
										res.statusCode = 500;
										res.send({});
										console.log(err);
										return;
									}
									res.statusCode = 200;
									res.send({
										peerids: results1[2].map((result) => result['PEERID']),
										username: decoded.username,
									});
								}
							);
						} else {
							res.statusCode = 401;
							res.send({});
						}
					}
				);
				try {
					connection.release();
				} catch (e) {
					console.log('after release', e);
				}
			});
		});
	}
}
