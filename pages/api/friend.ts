import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { pool } from '../../database/databaseinit';

export default function addFriend(req: NextApiRequest, res: NextApiResponse) {
	let token = req.cookies['rememberme'];
	let body = JSON.parse(req.body);
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.error(err);
			res.statusCode = 500;
			res.send({});
			return;
		}
		if (body.type === 'accept') {
			pool.query(
				`
				INSERT INTO Friends (USERID, FRIENDID) VALUES (
					(SELECT ID FROM Users WHERE USERNAME = ?), 
					(SELECT ID FROM Users WHERE USERNAME = ?)
				); 
				INSERT INTO Friends (USERID, FRIENDID) VALUES(
					(SELECT ID FROM Users WHERE USERNAME = ?), 
					(SELECT ID FROM Users WHERE USERNAME = ?)
				); 
				DELETE FROM FriendRequests WHERE RequesteeID = (
					SELECT ID FROM Users WHERE USERNAME = ?
				) 
				AND RequesterID = (
					SELECT ID FROM Users WHERE USERNAME = ?
				)
				`,
				[
					decoded.username,
					body.username,
					body.username,
					decoded.username,
					decoded.username,
					body.username,
				],
				(err, results, fields) => {
					if (err) {
						console.error(err);
						res.statusCode = 500;
						res.send({});
						return;
					}
					res.statusCode = 200;
					res.send({});
				}
			);
		} else if (body.type === 'request') {
			pool.getConnection((err, connection) => {
				if (err) {
					console.error(err);
					res.statusCode = 500;
					res.send({});
					return;
				}
				connection.query(
					`
					SELECT COUNT(RequesterID), COUNT(RequesteeID) FROM FriendRequests
					WHERE RequesterID = (SELECT ID FROM USERS WHERE USERNAME = ?) 
					AND RequesteeID = (SELECT ID FROM USERS WHERE USERNAME = ?);
					`,
					[decoded.username, body.username],
					(err, results, fields) => {
						if (err) {
							try {
								connection.release();
							} catch (e) {
								console.error('after release', e);
							}
							console.error(err);
							res.statusCode = 500;
							res.send({});
							return;
						}
						if (
							results[0]['COUNT(RequesterID)'] === 0 &&
							results[0]['COUNT(RequesteeID)'] === 0
						) {
							connection.query(
								`
					INSERT INTO FriendRequests (RequesterID, RequesteeID) VALUES (
						(SELECT ID FROM Users WHERE Username = ?), 
						(SELECT ID From Users WHERE Username = ?)
					)
					`,
								[decoded.username, body.username],
								(err, results, fields) => {
									if (err) {
										try {
											connection.release();
										} catch (e) {
											console.error('after release', e);
										}
										console.error(err);
										res.statusCode = 500;
										res.send({});
										return;
									}
									res.statusCode = 200;
									res.send({});
								}
							);
						} else {
							res.statusCode = 200;
							res.send({});
						}
					}
				);
				try {
					connection.release();
				} catch (e) {
					console.error('after release', e);
				}
			});
		} else if (body.type === 'reject') {
			pool.query(
				'DELETE FROM FriendRequests WHERE RequesterID = (SELECT ID FROM Users WHERE USERNAME = ?)',
				[body.username],
				(err, results, fields) => {
					if (err) {
						console.error(err);
						res.statusCode = 500;
						res.send({});
						return;
					}
					res.statusCode = 200;
					res.send({});
				}
			);
		}
	});
}
