FROM node:8

RUN mkdir /var/app
WORKDIR /var/app
ADD ./src /var/app/src
ADD package.json /var/app/package.json
ADD package-lock.json /var/app/package.lock.json
RUN npm install
EXPOSE 4000 

CMD npm start
