## Bureau NodeJs serverless sample backend

Bureau nodejs serverless sample backend repository for merchants

## How to test in local

1. Install serverless globally
`npm install -g serverless`

2. Run the following command
`sudo sls offline`

## How to deploy

1. Configure AWS credentials and set required variables in .env
`serverless config credentials --provider aws --key <AWS_ACCESS_KEY_ID> --secret <AWS_SECRET_ACCESS_KEY> --profile bureau-sample-backend`

2. Run the following command
`sudo sls deploy`
