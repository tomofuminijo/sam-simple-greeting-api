# **SAM を利用したシンプルなAPIのローカル実行およびデプロイサンプル**

このサンプルは、API Gateway/Lambda/DynamoDB を利用したシンプルなサーバレスアプリケーションを、SAM(Serverless Application Model) を利用して、ローカルでテスト実行した後にAWS 上にデプロイして動作確認するサンプルです。

# 実施手順

## Cloud9 の実行

任意のリージョンでCloud9 を作成します。（手順は割愛しますが、すべてデフォルト状態で作成してください。)

## サンプルアプリのインストール

Cloud9 上で操作します。  
Cloud9 でターミナルを一つ起動し、以下のコマンドを実行します。

```
git clone https://github.com/tomofuminijo/sam-simple-greeting-api.git
cd sam-simple-greeting-api
./init-local.sh
```

## DynamoDB ローカルの実行
次に、テスト実行します。DynamoDB も含めてローカル上で実施します。  
DynamoDB Local ようにターミナルを一つ起動し、以下のコマンドを実行します。

```
docker run -p 8000:8000 amazon/dynamodb-local
```

別のターミナルを起動して、以下のコマンドを実行してDynamoDB テーブルをDynamoDB Local 環境に作成します。

```
cd sam-simple-greeting-api
aws dynamodb create-table --cli-input-json file://./dynamodb/SAMDemoGreeting.json --endpoint-url http://localhost:8000 --region local-test
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region local-test
```

## サーバレスアプリケーションのローカル実行

以下のコマンドを実行します。

```
sam local start-api --env-vars local-env.json
```

別のターミナルを開いてローカル上に起動したAPIをテスト実行します。以下のコマンドを実行してデータを格納します。
```
curl -X PUT --data '{"hello":"こんにちは", "langname":"Japanese"}' http://localhost:3000/hello/ja
```

以下のような内容が出力されれば正常に実行できています。

```
{"result":"ok"}
```

以下のコマンドを実行して、格納したデータが取得できることを確認します。

```
curl -X GET http://localhost:3000/hello/ja
```

以下のような内容が出力されれば正常に実行できています。

```
{"lang":"ja","langname":"Japanese","hello":"こんにちは"}
```

DynamoDB Local の中身を確認します。

```
aws dynamodb get-item --table-name "SAMDemoGreeting" --key '{"lang": {"S":"ja"}}' --endpoint-url http://localhost:8000 --region local-test
```

以下のような内容が出力されれば実行できています。

```
{
    "Item": {
        "lang": {
            "S": "ja"
        }, 
        "langname": {
            "S": "Japanese"
        }, 
        "hello": {
            "S": "こんにちは"
        }
    }
}
```

## AWS にデプロイする

以下のコマンドを実行して、パッケージングおよびデプロイを実施します。  

```
cd sam-simple-greeting-api
sam deploy --guided
```

プロンプトが表示されたら[Stack Name] に以下のように入力し、それ以外は全てデフォルトでEnter を押します。

```
Stack Name [sam-app]: sam-demo-greeting-app
```

デプロイが始まると以下ような内容が表示されます。

```
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
ResourceStatus                               ResourceType                                 LogicalResourceId                            ResourceStatusReason                       
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
CREATE_IN_PROGRESS                           AWS::IAM::Role                               MyGreetingDynamoDBGetFunctionRole            -                                          
CREATE_IN_PROGRESS                           AWS::DynamoDB::Table                         SAMDemoGreeting                              -                                          
CREATE_IN_PROGRESS                           AWS::IAM::Role                               MyGreetingDynamoDBPutFunctionRole            -                                          
CREATE_IN_PROGRESS                           AWS::DynamoDB::Table                         SAMDemoGreeting                              Resource creation Initiated                
CREATE_IN_PROGRESS                           AWS::IAM::Role                               MyGreetingDynamoDBGetFunctionRole            Resource creation Initiated 

・・・ 略 ・・・

CREATE_COMPLETE                              AWS::CloudFormation::Stack                   sam-demo-greeting-app                        -                                          
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

```

以下のコマンドを実行して、データの登録および取得ができることを確認します。

```
GreetingApiUri=$(aws cloudformation describe-stacks --stack-name sam-demo-greeting-app --query 'Stacks[*].Outputs[?OutputKey==`GreetingApiUri`].OutputValue' --output text)
curl -X PUT --data '{"hello":"こんにちは", "langname":"Japanese"}' ${GreetingApiUri}/hello/ja
curl -X GET ${GreetingApiUri}/hello/ja
```

最後のコマンドで、以下の内容が出力されていれば正常に実行できています。

```
{"hello":"こんにちは","langname":"Japanese","lang":"j
```


## 後処理

削除する場合は、以下のコマンドを実行してください。

```
# SAM により作成されれたCloudFormation Stacksの削除
aws cloudformation delete-stack --stack-name sam-demo-greeting-app
aws cloudformation wait stack-delete-complete --stack-name sam-demo-greeting-app
```
