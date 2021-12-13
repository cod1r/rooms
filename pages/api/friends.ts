import {NextApiRequest, NextApiResponse} from "next";
import { pool } from '../../database/databaseinit';
import jwt from 'jsonwebtoken';

export default function friends(req: NextApiRequest, res: NextApiResponse) {
	//pool.query('SELECT USERNAME FROM USERS WHERE ID = (SELECT FriendID FROM Friends WHERE USERID = (SELECT ID FROM USERS WHERE EMAIL = ?))', [], (err, results, fields) => {
	//});
}
