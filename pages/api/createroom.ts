import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';
export default function createroom(req : NextApiRequest, res : NextApiResponse) {
	let room_info = JSON.parse(req.body);
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
		let str_query = 'INSERT INTO ROOMS (RoomName) VALUES(?)';
		let cb = (results, params) => {
			params['res'].statusCode = 200;
			params['res'].send();
		};
		let params = {
			res: res
		}
		query(str_query, [room_info['roomname']], cb, params);
	});
}
