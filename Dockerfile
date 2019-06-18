FROM node:11.15.0-stretch AS build

RUN apt update &&\
    apt install git curl && \
    curl -o- -L https://yarnpkg.com/install.sh | sh

ENV PATH $HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH

RUN mkdir /kad
WORKDIR /kad
COPY . .
RUN yarn

WORKDIR /kad/examples/express
RUN yarn

EXPOSE 60000

CMD [ "yarn","portal" ]