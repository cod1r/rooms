import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../database/databaseinit';
export default function createroom(req : NextApiRequest, res : NextApiResponse) {
	// TODO:
	let str_query = 'INSERT INTO ROOMS (roomID, UserID) VALUES(?, ?)';
	let cb = () => {
	}
	let parameters = {
	}
	query(str_query, [], cb, parameters);
}
