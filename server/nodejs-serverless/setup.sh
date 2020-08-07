#!/bin/sh
echo "Creating .env file ..."
tee -a .env << END
REGION=ap-south-1
ENVIRONMENT=dev
REDIS_CLUSTER_URL=
SECURITY_GROUP_ID=
SUBNET_1=
SUBNET_2=
BUREAU_USER_INFO_URL=
BUREAU_CLIENT_ID=
BUREAU_CLIENT_SECRET=
END

echo "Done creating config files"
