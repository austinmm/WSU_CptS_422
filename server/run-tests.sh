#!/bin/bash

# Remove any running BATS MySQL containers
docker stop $(docker ps -aq --filter=label=bats-mysql)
docker rm $(docker ps -aq --filter=label=bats-mysql)

# Setup MySQL container
echo "Starting MySQL container"
docker run -d \
  --label bats-mysql $CONTAINER_NAME \
  -e MYSQL_ROOT_PASSWORD=test_pwd \
  -e MYSQL_DATABASE=bats \
  -p 3306:3306 \
  mysql:5.6

echo "Waiting for db to initialize..."
sleep 10

# Run tests
mocha

# Stop and remove MySQL container
echo "Cleaning up..."
docker stop $(docker ps -aq --filter=label=bats-mysql)
docker rm $(docker ps -aq --filter=label=bats-mysql)

$SHELL