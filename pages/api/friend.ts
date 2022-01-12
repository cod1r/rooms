import {
	BatchWriteItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	PutItemCommand,
	UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '../../database/databaseinit';

export default function addFriend(req: NextApiRequest, res: NextApiResponse) {
	let token = req.cookies['rememberme'];
	let body = JSON.parse(req.body);
	jwt.verify(token, process.env.private_key, (err, decoded) => {
		if (err) {
			console.error(err);
			res.status(500).send({});
			return;
		}
		switch (body.type) {
			case 'accept':
				{
				}
				break;
			case 'delete':
				break;
			case 'reject':
				{
				}
				break;
			case 'request':
				{
				}
				break;
			default:
				console.error('body.type is unknown');
				res.status(500).send({});
				break;
		}
	});
}
