import { PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { v1 } from 'uuid';
import { client } from '../../database/databaseinit';
export default function register(req: NextApiRequest, res: NextApiResponse) {
	let credentials = JSON.parse(req.body);
	bcrypt.hash(credentials.password, 10, (err, hash) => {
		if (err) {
			console.error(err);
			res.statusCode = 500;
			res.send({});
			return;
		}
		(async () => {
			try {
				let QueryCommandResponse = await client.send(
					new QueryCommand({
						IndexName: 'Username-index',
						KeyConditionExpression: 'Username = :val',
						ExpressionAttributeValues: {
							':val': {
								S: credentials.username,
							},
						},
						TableName: 'Users',
					}),
				);
				let uid = v1();
				if (
					QueryCommandResponse.$metadata.httpStatusCode === 200
					&& QueryCommandResponse.Items.length === 0
				) {
					let PutItemResponse = await client.send(
						new PutItemCommand({
							Item: {
								UserID: {
									S: uid,
								},
								Email: {
									S: credentials.email,
								},
								Username: {
									S: credentials.username,
								},
								Password: {
									S: hash,
								},
								Friends: {
									L: [],
								},
								Bio: {
									S: '',
								},
								Followers: {
									L: [],
								},
							},
							TableName: 'Users',
						}),
					);
					if (
						PutItemResponse['$metadata'].httpStatusCode === 200
					) {
						jwt.sign(
							{
								uid: uid,
								username: credentials.username,
								password: hash,
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
						res.status(401).send({});
					}
				} else {
					res.status(401).send({});
				}
			} catch (err) {
				console.error(err);
				res.status(500).send({});
			}
		})();
	});
}
