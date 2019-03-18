#!/bin/sh

aws dynamodb create-table --cli-input-json file://./DevDemoGreeting.json 
