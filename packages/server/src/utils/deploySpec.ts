export const spec = `version: 0.2

env:
  #variables:
     # key: "value"
     # key: "value"
  parameter-store:
     bucketName: "/convey/app/bucketName"
     queueUrl: "/convey/app/queueUrl"
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
      # - command
  build:
    commands:
      - env 
      - aws s3 cp s3://$bucketName/scripts . --recursive
      - node docker.js
      - rm -rf docker.js
      - cd /tmp
      - tar -C $CODEBUILD_SRC_DIR -zcvf build.tar.gz .
      - aws s3 cp build.tar.gz s3://$bucketName/customer/builds/build.tar.gz
      - aws sqs send-message --queue-url $queueUrl --message-body "s3://$bucketName/customer/builds/build.tar.gz"
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