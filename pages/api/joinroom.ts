import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';
export default function joinroom(req: NextApiRequest, res: NextApiResponse) {
	let room_info = JSON.parse(req.body);
	console.log('room_info', room_info);
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
		// assuming passwords hash to a unique value
		// otherwise we need to put email into the jwt token
		let str_query = 'SELECT ID FROM USERS WHERE password = ?';
		query(str_query, [decoded['password']], (results, params) => {
			let str_query2 = 'INSERT INTO PersonInRoom (USERID, ROOMNAME, PEERID) VALUES (?, ?, ?)';
			query(str_query2, [results[0]['ID'], room_info['roomname'], room_info['id']], (results2, params2) => {
				let str_query3 = 'SELECT PEERID FROM PersonInRoom WHERE ROOMNAME = ?';
				query(str_query3, [room_info['roomname']], (results3, params3) => {
					console.log('results', results3);
					params3['res'].statusCode = 200;
					params3['res'].send({ peers: results3.map((result) => result['PEERID'])});
				}, {res: params2['res']});
			}, {res: params['res']});

		}, {res: res});
	});
}
