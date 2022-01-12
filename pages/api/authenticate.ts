import { GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '../../database/databaseinit';
export default function authenticate(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if ('cookie' in req.headers) {
		let cookies = req.cookies;
		let token = cookies['rememberme'];
		jwt.verify(token, process.env.private_key, (err, decoded) => {
			if (err) {
				console.log(err);
				res.status(401).send({});
				return;
			}
			// maybe check if the password and username is in the database but for now we will just send a 200 status code
			client
				.send(
					new QueryCommand({
						KeyConditionExpression: 'Username = :val',
						ExpressionAttributeValues: {
							':val': {
								S: decoded.username,
							},
						},
						IndexName: 'Username-index',
						TableName: 'Users',
					}),
				)
				.then((dbRes) => {
					if (
						dbRes['$metadata'].httpStatusCode === 200
						&& dbRes.Items.length > 0
					) {
						res.status(200).send({});
					} else {
						res.status(401).send({});
					}
				})
				.catch((e) => {
					console.error(e);
					res.status(500).send({});
				});
		});
	} else {
		res.status(401).json({ authenticated: false });
	}
}
