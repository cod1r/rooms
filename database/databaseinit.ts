import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

let client = new DynamoDBClient({
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID_ROOMS,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ROOMS,
	},
	region: 'us-east-1',
});

export { client };
