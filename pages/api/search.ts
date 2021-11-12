import { query } from '../../database/databaseinit';
export default function search(req, res) {
	query('SELECT ROOMNAME FROM ROOMS', [], (results, params) => {
		params['res'].statusCode = 200;
		params['res'].send({ rooms: results.map((result) => result['ROOMNAME'])});
	}, {
		res: res
	});
}
