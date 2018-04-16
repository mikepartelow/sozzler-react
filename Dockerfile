FROM node

RUN npm install -g create-react-app
RUN create-react-app my-app
RUN rm -f my-app/src/*
RUN npm i react react-dom react-helmet

WORKDIR /my-app/

CMD npm start