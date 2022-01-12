import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

let client = new DynamoDBClient({
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
	region: 'us-east-1',
});

export { client };
