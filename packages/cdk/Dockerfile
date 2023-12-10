FROM gcr.io/kaniko-project/executor:v1.18.0-debug 
COPY ./config.json /kaniko/.docker/config.json

ENV AWS_SDK_LOAD_CONFIG=true

RUN mkdir -p /root/.aws
COPY ./aws/ /root/.aws

CMD [ "--context" , "", "--context-sub-path", "./", "--dockerfile", "", "--destination", "", "--force"]
