const AWS = require('aws-sdk');

if (process.env.DYNAMDB_LOCALURL) {
    AWS.config.update({
        endpoint: process.env.DYNAMDB_LOCALURL,
        retion: process.env.DYNAMODB_REGION
    });
}

const ddb = new AWS.DynamoDB.DocumentClient();


exports.handler = (event, context, callback) => {

    // Because we're using a Cognito User Pools authorizer, all of the claims
    // included in the authentication token are provided in the request context.
    // This includes the username as well as other attributes.
    const lang = event.pathParameters.lang;

    console.log('lang : ' + lang);

    var params = {
        TableName: "DevDemoGreeting",
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

