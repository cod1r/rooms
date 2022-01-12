let { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

let client = new DynamoDBClient({
	credentials: {
		accessKeyId: 'AKIAUJHABJ5BIDR4JRCB',
		secretAccessKey: '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',
	},
	region: 'us-east-1',
});

let send = async () => {
	let command = new GetItemCommand({
		Key: {
			Username: {
				S: 'jason',
			},
		},
		TableName: 'Users',
	});
	let response = await client.send(command);
	console.log(response);
};
send();
