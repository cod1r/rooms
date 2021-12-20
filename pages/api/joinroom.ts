import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';
// TODO: merge all sql queries into just one big nested SQL query
export default function joinroom(req: NextApiRequest, res: NextApiResponse) {
	console.log('joinroom api called');
	if ('cookie' in req.headers) {
		let room_info = JSON.parse(req.body);
		let cookies = req.cookies;
		let token = cookies['rememberme'];
		jwt.verify(token, process.env.private_key, (err, decoded) => {
			if (err) {
				console.log(err);
				return;
			}
			pool.getConnection((err, connection) => {
				if (err) {
					try { connection.release(); } catch (e) { console.log('after release', e) };
					console.log(err);
					return;
				}
				connection.query('SELECT COUNT(ROOMNAME) FROM Rooms WHERE ROOMNAME = ?', [room_info['roomname']], (err, results, fields) => {
					if (err) {
						try { connection.release(); } catch (e) { console.log('after release', e) };
						console.log(err);
						return;
					}
					if (results[0]['COUNT(ROOMNAME)'] === 1) {
						connection.query('DELETE FROM PersonInRoom WHERE USERID = (SELECT ID FROM Users WHERE password = ?)', [decoded['password']], (err, results, fields) => {
							if (err) {
								try { connection.release(); } catch (e) { console.log('after release', e) };
								console.log(err);
								return;
							}
						});
						connection.query('INSERT INTO PersonInRoom (USERID, ROOMNAME, PEERID) VALUES ((SELECT ID FROM Users WHERE password = ?) , ?, ?)', 
							[decoded.password, room_info['roomname'], room_info['id']], (err, results1, fields) => {
								if (err) {
									try { connection.release(); } catch (e) { console.log('after release', e) };
									console.log(err);
									return;
								}
								connection.query('SELECT USERNAME, PEERID FROM PersonInRoom INNER JOIN Users ON PersonInRoom.USERID = Users.ID WHERE ROOMNAME = ?', 
									[room_info['roomname']], 
									(err, results, fields) => {
										if (err) {
											try { connection.release(); } catch (e) { console.log('after release', e) };
											console.log(err);
											return;
										}
										res.statusCode = 200;
										let users = {};
										results.forEach((result) => users[result['USERNAME']] = result['PEERID']);
										res.send(users);
								});
							});
						//try { connection.release(); } catch (e) { console.log('after release', e) };
					}
					else {
						res.statusCode = 401;
						res.send({});
						//try { connection.release(); } catch (e) { console.log('after release', e) };
					}
				});
			});
		});
	}
}
