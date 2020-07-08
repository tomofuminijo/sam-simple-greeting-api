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

    console.log('Received event: ', event);

    const lang = event.pathParameters.lang;
    const body = JSON.parse(event.body);
    const hello = body.hello;
    const langname = body.langname;
    console.log('lang : ', lang);
    console.log('body : ', body);
    console.log('hello : ', hello);
    console.log('langname : ', langname);

    var params = {
        TableName: DDB_TABLE,
        Item: {
            "lang": lang,
            "hello": hello,
            "langname": langname
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
