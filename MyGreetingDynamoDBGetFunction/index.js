const AWS = require('aws-sdk');

// Settings for DynamoDB Local
if (process.env.DYNAMDB_LOCALURL) {
    AWS.config.update({
        endpoint: process.env.DYNAMDB_LOCALURL,
        region: process.env.DYNAMODB_REGION
    });
}

const ddb = new AWS.DynamoDB.DocumentClient();
const DDB_TABLE = process.env['DDB_TABLE'];


exports.handler = (event, context, callback) => {

    const lang = event.pathParameters.lang;

    console.log('lang : ' + lang);

    var params = {
        TableName: DDB_TABLE,
        Key: {
            "lang": lang
        }
    };
    ddb.get(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            errorResponse(err.message, context.awsRequestId, callback)
        }
        else {
            console.log("Get succeeded.: ", data);

            callback(null, {
                statusCode: 200,
                body: JSON.stringify(data.Item),
                headers: {
                    'Access-Control-Allow-Origin': '*',
                }
            });
        }
    });


};

function errorResponse(errorMessage, awsRequestId, callback) {
    callback(null, {
        statusCode: 500,
        body: JSON.stringify({
            Error: errorMessage,
            Reference: awsRequestId,
        }),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    });
}

