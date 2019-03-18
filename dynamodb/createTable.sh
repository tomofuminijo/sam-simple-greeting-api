#!/bin/sh

aws dynamodb create-table --cli-input-json file://./DevDemoGreeting.json  --region us-east-1
#aws dynamodb create-table --cli-input-json file://./DevDemoGreeting.json --endpoint-url http://localhost:8000 --region us-east-1
