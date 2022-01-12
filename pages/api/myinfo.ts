import { AttributeValue, BatchGetItemCommand, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '../../database/databaseinit';

export default function myinfo(req: NextApiRequest, res: NextApiResponse) {
	let body = JSON.parse(req.body);
	let token = req.cookies['rememberme'];
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.error(err);
			res.status(500).send({});
			return;
		}
		switch (body.type) {
			case 'get':
				{
					// can we combine some of these db requests
					client
						.send(
							new GetItemCommand({
								Key: {
									UserID: {
										S: decoded.uid,
									},
								},
								TableName: 'Users',
							}),
						)
						.then((dbResponse) => {
							if (
								dbResponse.$metadata.httpStatusCode === 200
								&& dbResponse.Item !== undefined
								&& dbResponse.Item.Friends.L.length > 0
							) {
								client
									.send(
										new BatchGetItemCommand({
											RequestItems: {
												Users: {
													Keys: dbResponse.Item.Friends.L.map((AttributeVal) => Object.fromEntries([['UserID', AttributeVal.S]])),
												},
											},
										}),
									)
									.then((dbResponseIDToUsername) => {
										if (
											dbResponseIDToUsername.$metadata.httpStatusCode === 200
										) {
											res.status(200).send({
												username: decoded.username,
												bio: dbResponse.Item.Bio.S,
												friends: dbResponseIDToUsername.Responses.Users.map(
													(User) => User.Username.S,
												),
											});
										}
									})
									.catch((e) => {
										console.error(e);
										res.status(500).send({});
									});
							} else if (dbResponse.Item.Friends.L.length === 0) {
								res.status(200).send({
									username: decoded.username,
									bio: dbResponse.Item.Bio.S,
									friends: [],
								});
							} else {
								res.status(401).send({});
							}
						})
						.catch((e) => {
							console.error(e);
							res.status(500).send({});
						});
				}
				break;
			case 'edit':
				{
					client
						.send(
							new UpdateItemCommand({
								Key: {
									Username: {
										S: decoded.username,
									},
								},
								TableName: 'Users',
								UpdateExpression: 'SET Bio = if_not_exists(Bio, :B)',
								ExpressionAttributeValues: {
									':B': {
										S: body.bio,
									},
								},
							}),
						)
						.then((dbResponse) => {
							if (dbResponse.$metadata.httpStatusCode === 200) {
								res.status(200).send({});
							} else {
								console.error(dbResponse);
								res.status(401).send({});
							}
						})
						.catch((e) => {
							console.error(e);
							res.status(500).send({});
						});
				}
				break;
			default:
				console.error('myinfo api body.type unknown');
				res.status(500).send({});
				break;
		}
	});
}
