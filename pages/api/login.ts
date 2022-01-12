import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '../../database/databaseinit';
export default function login(req: NextApiRequest, res: NextApiResponse) {
	let credentials = JSON.parse(req.body);
	client
		.send(
			new GetItemCommand({
				Key: {
					Username: {
						S: credentials.username,
					},
				},
				TableName: 'Users',
			}),
		)
		.then((dbResponse) => {
			if (
				dbResponse['$metadata'].httpStatusCode === 200
				&& dbResponse.Item !== undefined
			) {
				bcrypt.compare(
					credentials.password,
					dbResponse.Item.Password.S,
					(err, result) => {
						if (err) {
							console.error(err);
							res.status(500).send({});
							return;
						}
						if (result) {
							jwt.sign(
								{
									uid: dbResponse.Item.UserID.S,
									username: credentials.username,
									password: dbResponse.Item.Password.S,
								},
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
							res.status(401).send({});
						}
					},
				);
			} else {
				res.status(401).send({});
			}
		})
		.catch((e) => {
			console.error(e);
			res.status(500).send({});
		});
}
