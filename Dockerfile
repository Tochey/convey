FROM --platform=linux/amd64 node:19-alpine AS node
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.7.1 /lambda-adapter /opt/extensions/lambda-adapter

COPY . "/var/task"
WORKDIR "/var/task"

# Install call deps - Install curl for health check if using lb
RUN apk --no-cache add curl && \
    touch .env && \
    npm ci

RUN npm run backend:build

EXPOSE 8080
ENV HOST=0.0.0.0
CMD ["npm", "run", "backend"]