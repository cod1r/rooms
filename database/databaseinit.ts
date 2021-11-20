import * as mysql from 'mysql';
var pool = mysql.createPool({
	host     : process.env.DB_HOST,
	user     : process.env.DB_USER,
	password : process.env.DB_PASS,
	database : process.env.DB_DATABASE
});
pool.on('acquire', (connection) => {
	console.log('connection %d acquired', connection.threadId);
});
pool.on('release', (connection) => {
	console.log('connection %d released', connection.threadId);
});

export { pool };
