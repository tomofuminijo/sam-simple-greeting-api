#!/bin/sh

aws dynamodb create-table --cli-input-json file://./dynamodb/DevDemoGreeting.json  --region us-east-1
#aws dynamodb create-table --cli-input-json file://./dynamodb/DevDemoGreeting.json --endpoint-url http://localhost:8000 --region us-east-1
