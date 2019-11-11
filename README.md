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
aws dynamodb create-table --cli-input-json file://./dynamodb/DevDemoGreeting.json --endpoint-url http://localhost:8000 --region local-test
aws dynamodb list-tables --endpoint-url http://localhost:8000 --region local-test
```

## サーバレスアプリケーションのローカル実行

以下のコマンドを実行します。

```
sam local start-api --env-vars local-env.json --template template-noauth.yaml
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
aws dynamodb get-item --table-name "DevDemoGreeting" --key '{"lang": {"S":"ja"}}' --endpoint-url http://localhost:8000 --region local-test
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
<your_bucket_name> は適当な名前に変更してください。

```
# Deploya 用のS3 バケットの作成
aws s3 mb s3://<your_bucket_name>

# 
sam package --template-file template-noauth.yaml --output-template-file packaged.yaml --s3-bucket <your_bucket_name>
sam deploy --template-file packaged.yaml --stack-name sam-simple-greeting-api --capabilities CAPABILITY_IAM
```

DynamoDB テーブルを作成します。

```
aws dynamodb create-table --cli-input-json file://./dynamodb/DevDemoGreeting.json

```

以下のコマンドを実行して、データの登録および取得ができることを確認します。

```
GreetingApiUri=$(aws cloudformation describe-stacks --stack-name sam-simple-greeting-api --query 'Stacks[*].Outputs[?OutputKey==`GreetingApiUri`].OutputValue' --output text)
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
# DynamoDB の削除
aws dynamodb delete-table --table-name DevDemoGreeting

# SAM により作成されれたCloudFormation Stacksの削除
aws cloudformation delete-stack --stack-name sam-simple-greeting-api

# デプロイ用S3 バケットを削除
aws s3 rb s3://<your_bucket_name> --force
```
