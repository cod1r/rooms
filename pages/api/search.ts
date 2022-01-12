import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';

let search = (req: NextApiRequest, res: NextApiResponse) => {
	let body = JSON.parse(req.body);
	pool.query(
		'SELECT USERNAME FROM Users WHERE USERNAME LIKE ?',
		['%' + body.query + '%'],
		(err, results, fields) => {
			if (err) {
				console.error(err);
				res.statusCode = 500;
				res.send({});
				return;
			}
			res.statusCode = 200;
			res.send({
				queryResults: results.map((result) => result['USERNAME']),
			});
		},
	);
};
export default search;
