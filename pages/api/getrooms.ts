import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';
export default function getrooms(req: NextApiRequest, res: NextApiResponse) {
	let body = JSON.parse(req.body);
	if ('query' in body) {
		pool.query("SELECT ROOMNAME FROM ROOMS WHERE ROOMNAME LIKE ?", ['%' + body.query + '%'], (err, results, fields) => {
			if (err) {
				console.log(err);
				return;
			}
			res.statusCode = 200;
			res.send({'rooms': results.map(res => res['ROOMNAME'])});
		});
	}
}
