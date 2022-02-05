import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { NextApiResponse, NextApiRequest } from "next";
import { client } from '../../database/databaseinit';

interface Body {
  roomid: string
}

export default function removeroom(req: NextApiRequest, res: NextApiResponse) {
  let body: Body = JSON.parse(req.body);
  (async () => {
    try {
      let deleteResponse = await client.send(new DeleteItemCommand({
        Key: {
          RoomID: {
            S: body.roomid
          }
        },
        TableName: 'Rooms'
      }));

      if (deleteResponse.$metadata.httpStatusCode === 200) {
        res.status(200).send({});
      } else {
        res.status(500).send({});
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({});
    }
  })();
}