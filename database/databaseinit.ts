import * as mysql from 'mysql';
export function query(query : string, values : Array<string | number>, callback = (one, two) => {}, parameters = {}) {
	var connection = mysql.createConnection({
	  host     : process.env.DB_HOST,
	  user     : process.env.DB_USER,
	  password : process.env.DB_PASS,
	  database : process.env.DB_DATABASE
	});
	connection.connect();
	connection.query(query, values, (err, results, fields) => {
		if (err) {
			console.log(err);
		}
		if (results) {
			callback(results, parameters);
		}
	});
	connection.end();
}
