FROM gcr.io/kaniko-project/executor:v1.18.0-debug 
COPY ./config.json /kaniko/.docker/config.json

ENV AWS_SDK_LOAD_CONFIG=true

RUN mkdir -p /root/.aws
COPY ./aws/ /root/.aws

CMD [ "--context" , "s3://convey-bucket/customer/builds/context.tar.gz", "--context-sub-path", "./", "--dockerfile", "Dockerfile", "--destination", "332521570261.dkr.ecr.us-east-1.amazonaws.com/convey-test:latest", "--force"]
