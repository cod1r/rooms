import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '../../database/databaseinit';

let rooms = (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method === 'GET') {
		res.redirect(308, '/home');
	} else {
		(async () => {
			try {
				let ScanResponse = await client.send(
					new ScanCommand({
						Limit: 20,
						TableName: 'Rooms',
					}),
				);
				if (ScanResponse.$metadata.httpStatusCode === 200) {
					res.status(200).send({
						roomsDB: ScanResponse.Items.map(room =>
							Object.fromEntries([['name', room.Roomname.S], ['id', room.RoomID.S], [
								'roomDescription',
								room.RoomDescription.S,
							]])
						),
					});
				} else {
					res.status(500).send({});
				}
			} catch (err) {
				console.error(err);
			}
		})();
	}
};

export default rooms;
