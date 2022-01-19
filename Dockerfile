FROM node:alpine

WORKDIR /app

COPY package.json /app
COPY yarn.lock /app
# ARG NODE_ENV
# RUN if [ "$NODE_ENV" = "development" ]; \
#         then yarn install; \
#         else yarn install --production; \
#         fi
RUN yarn
COPY . /app
RUN yarn build

EXPOSE 4000

CMD [ "yarn", "start:prod" ]