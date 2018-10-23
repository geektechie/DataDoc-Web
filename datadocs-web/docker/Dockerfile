FROM node:8

RUN apt-get update
RUN apt-get install -y libnotify-bin

ADD src datadocs-web/src
ADD gulpfile.js datadocs-web/
ADD package.json datadocs-web/
ADD rconfig.js datadocs-web/

WORKDIR datadocs-web/

RUN npm install gulp-cli -g
RUN npm install gulp -D
RUN npm i gulp-exec
RUN npm install

VOLUME /datadocs-web/src

ENTRYPOINT ["gulp", "watch"]