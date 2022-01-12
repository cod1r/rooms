import { BatchGetItemCommand, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '../../database/databaseinit';

interface Body {
	roomid: string;
}

export default function joinroom(req: NextApiRequest, res: NextApiResponse) {
	if ('cookie' in req.headers) {
		let body: Body = JSON.parse(req.body);
		let cookies = req.cookies;
		let token = cookies['rememberme'];
		jwt.verify(token, process.env.private_key, (err, decoded) => {
			if (err) {
				res.status(401).send({});
				console.log(err);
				return;
			}
			(async () => {
				try {
					let GetItemResponse = await client.send(
						new GetItemCommand({
							Key: {
								RoomID: {
									S: body.roomid,
								},
							},
							TableName: 'Rooms',
						}),
					);
					if (
						GetItemResponse.$metadata.httpStatusCode === 200
						&& GetItemResponse.Item !== undefined
					) {
						res.status(200).send({
							HostPeerID: GetItemResponse.Item.HostPeerID.S,
							username: decoded.username,
						});
					} else {
						res.status(401).send({});
					}
				} catch (err) {
					console.error(err);
					res.status(500).send({});
				}
			})();
		});
	} else {
		res.status(401).send({});
	}
}
