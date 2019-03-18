const AWS = require('aws-sdk');

if (process.env.DYNAMDB_LOCALURL) {
    AWS.config.update({
        endpoint: process.env.DYNAMDB_LOCALURL,
        retion: process.env.DYNAMODB_REGION
    });
}
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    console.log('Received event: ', event);

    // Because we're using a Cognito User Pools authorizer, all of the claims
    // included in the authentication token are provided in the request context.
    // This includes the username as well as other attributes.
    const lang = event.pathParameters.lang;
    const body = JSON.parse(event.body);
    const hello = body.hello;
    console.log('lang : ', lang);
    console.log('body : ', body);
    console.log('hello : ', hello);

    var params = {
        TableName: "DevDemoGreeting",
        Item: {
            "lang": lang,
            "hello": hello
        }
    };
    ddb.put(params, function(err, data) {
        if (err) {
            console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
            errorResponse(err.message, context.awsRequestId, callback)
        }
        else {
            console.log("Put succeeded.: ", data);
            //            console.log("Query succeeded.: " + JSON.stringify(data));

            callback(null, {
                statusCode: 200,
                body: JSON.stringify({ "result": "ok" }),
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
