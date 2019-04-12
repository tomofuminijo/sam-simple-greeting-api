#!/bin/sh

aws dynamodb create-table --cli-input-json file://./dynamodb/DevDemoGreeting.json
#aws dynamodb create-table --cli-input-json file://./dynamodb/DevDemoGreeting.json --endpoint-url http://localhost:8000 --region us-east-1
