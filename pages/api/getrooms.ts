import { NextApiRequest, NextApiResponse } from 'next';
import { pool } from '../../database/databaseinit';

// the way I set up getrooms and getusers is a little wonky since getusers also 
// returns search results as well as friends for the user and how I know whether to return
// search results or friends is with the querytype parameter in the json passed from 
// the client to the server.
export default function getrooms(req: NextApiRequest, res: NextApiResponse) {
	let body = JSON.parse(req.body);
	if ('search' in body) {
		pool.query("SELECT ROOMNAME FROM Rooms WHERE ROOMNAME LIKE ?", ['%' + body.search + '%'], (err, results, fields) => {
			if (err) {
				console.log(err);
				return;
			}
			res.statusCode = 200;
			res.send({'rooms': results.map(res => res['ROOMNAME'])});
		});
	}
}
