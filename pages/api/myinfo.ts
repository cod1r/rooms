import {
	AttributeValue,
	BatchGetItemCommand,
	GetItemCommand,
	QueryCommand,
	UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
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
					(async () => {
						let GetItemResponse = await client.send(
							new GetItemCommand({
								Key: {
									UserID: {
										S: decoded.uid,
									},
								},
								TableName: 'Users',
							}),
						);
						if (GetItemResponse.$metadata.httpStatusCode === 200 && GetItemResponse.Item !== undefined) {
							let QueryResponse = await client.send(
								new QueryCommand({
									IndexName: 'HostID-index',
									KeyConditionExpression: 'HostID = :val',
									ExpressionAttributeValues: {
										':val': {
											S: GetItemResponse.Item.UserID.S,
										},
									},
									TableName: 'Rooms',
								}),
							);
							if (QueryResponse.$metadata.httpStatusCode === 200) {
								res.status(200).send({
									roomsDB: QueryResponse.Items.map(room =>
										Object.fromEntries([['name', room.Roomname.S], ['id', room.RoomID.S], [
											'roomDescription',
											room.RoomDescription.S,
										]])
									),
									usernameDB: decoded.username,
									bioDB: GetItemResponse.Item.Bio.S,
								});
							} else {
							}
						} else {
						}
					})();
				}
				break;
			case 'edit':
				{
					client
						.send(
							new UpdateItemCommand({
								Key: {
									UserID: {
										S: decoded.uid,
									},
								},
								TableName: 'Users',
								UpdateExpression: 'SET Bio = :B',
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
