const https = require('https');
const fs = require('fs');
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const options = {
	key: fs.readFileSync('./localhost+2-key.pem'),
	cert: fs.readFileSync('./localhost+2.pem')
};

app.prepare().then(() => {
	https.createServer(options, (req, res) => {
		// Be sure to pass `true` as the second argument to `url.parse`.
		// This tells it to parse the query portion of the URL.
		const parsedUrl = parse(req.url, true)
		const { pathname, query } = parsedUrl

		handle(req, res, parsedUrl)
	}).listen(3000, (err) => {
		if (err) throw err;
		console.log('> Ready on https://localhost:3000');
	});
});
