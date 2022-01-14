import { GetItemCommand, PutItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { v1 } from 'uuid';
import { client } from '../../database/databaseinit';

export default function createroom(req: NextApiRequest, res: NextApiResponse) {
	let cookies = req.cookies;
	let token = cookies['rememberme'];
	let body = JSON.parse(req.body);
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.log(err);
			res.status(500).send({});
			return;
		}
		(async () => {
			try {
				let RoomID = v1();
				let QueryCommandResponse = await client.send(
					new QueryCommand({
						IndexName: 'Username-index',
						KeyConditionExpression: 'Username = :val',
						ExpressionAttributeValues: {
							':val': {
								S: decoded.username,
							},
						},
						TableName: 'Users',
					}),
				);
				if (QueryCommandResponse.$metadata.httpStatusCode === 200 && QueryCommandResponse.Items.length > 0) {
					let PutItemResponse = await client.send(
						new PutItemCommand({
							Item: {
								Roomname: {
									S: body.roomname,
								},
								RoomID: {
									S: RoomID,
								},
								RoomDescription: {
									S: body.roomdescription,
								},
								HostID: {
									S: QueryCommandResponse.Items[0].UserID.S,
								},
								NumberOfPeople: {
									N: '0',
								},
							},
							TableName: 'Rooms',
						}),
					);
					if (PutItemResponse.$metadata.httpStatusCode === 200) {
						res.status(200).send({
							roomid: RoomID,
						});
					} else {
						res.status(401).send({});
					}
				}
			} catch (err) {
				console.error(err);
				res.status(500).send({});
			}
		})();
	});
}
