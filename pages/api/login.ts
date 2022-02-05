import { QueryCommand } from '@aws-sdk/client-dynamodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '../../database/databaseinit';

interface CredentialBody {
	username: string;
	password: string;
}

export default function login(req: NextApiRequest, res: NextApiResponse) {
	(async () => {
		let credentials: CredentialBody = JSON.parse(req.body);
		try {
			let queryResponse = await client.send(new QueryCommand({
				IndexName: 'Username-index',
				KeyConditionExpression: 'Username = :val',
				ExpressionAttributeValues: {
					':val': {
						S: credentials.username,
					},
				},
				TableName: 'Users',
			}));
			if (queryResponse.$metadata.httpStatusCode === 200 && queryResponse.Count > 0) {
				bcrypt.compare(
					credentials.password,
					queryResponse.Items[0].Password.S,
					(err, result) => {
						if (err) {
							console.error(err);
							res.status(500).send({});
							return;
						}
						if (result) {
							jwt.sign(
								{
									uid: queryResponse.Items[0].UserID.S,
									username: credentials.username,
									password: queryResponse.Items[0].Password.S,
								},
								process.env.private_key,
								(err, token) => {
									if (err) {
										console.error(err);
										res.status(500).send({});
										return;
									}
									res.setHeader(
										'Set-Cookie',
										`rememberme=${token}; Max-Age=${60 * 60 * 24 * 365}; HttpOnly`,
									);
									res.status(200).send({});
								},
							);
						} else {
							res.status(401).send({
								error: 'username or password is incorrect.',
							});
						}
					},
				);
			} else if (queryResponse.Count === 0) {
				res.status(401).send({
					error: 'username or password is incorrect.',
				});
			} else {
				res.status(500).send({});
			}
		} catch (err) {
			console.error(err);
			res.status(500).send({});
		}
	})();
}
