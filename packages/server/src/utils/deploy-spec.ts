export const spec = `version: 0.2

#env:
  #variables:
     # key: "value"
     # key: "value"
  #parameter-store:
     # key: "value"
     # key: "value"
  #secrets-manager:
     # key: secret-id:json-key:version-stage:version-id
     # key: secret-id:json-key:version-stage:version-id
  #exported-variables:
     # - variable
     # - variable
  #git-credential-helper: yes
#batch:
  #fast-fail: true
  #build-list:
  #build-matrix:
  #build-graph:
phases:
  #install:
    #runtime-versions:
      # name: version
      # name: version
    #commands:
      # - command
      # - command
  pre_build:
    commands:
      - ls
  build:
    commands:
      - USER_ID=$(echo "$DEPLOYMENT" | jq -r '.user')
      - DEPLOYMENT_ID=$(echo "$DEPLOYMENT" | jq -r '._id')
      - BUILD_ASSET_KEY=build.tar.gz
      - S3_PATH=s3://$BUCKET_NAME/customer/deployments/cus-$USER_ID/$BUILD_ASSET_KEY
      - MESSAGE_BODY='{"userId":"'"$USER_ID"'","deploymentId":"'"$DEPLOYMENT_ID"'","s3Path":"'"$S3_PATH"'"}'
      - aws s3 cp s3://$BUCKET_NAME/scripts . --recursive
      - node docker.js
      - env 
      - cd /tmp
      - tar -C $CODEBUILD_SRC_DIR -zcvf $BUILD_ASSET_KEY .
      - aws s3 cp $BUILD_ASSET_KEY $S3_PATH
      - echo $MESSAGE_BODY > data.json
      - aws sqs send-message --queue-url $QUEUE_URL --message-body file://data.json
  #post_build:
    #commands:
      # - command
      # - command
#reports:
  #report-name-or-arn:
    #files:
      # - location
      # - location
    #base-directory: location
    #discard-paths: yes
    #file-format: JunitXml | CucumberJson
#artifacts:
  #files:
    # - location
    # - location
  #name: $(date +%Y-%m-%d)
  #discard-paths: yes
  #base-directory: location
#cache:
  #paths:
    # - paths`;
