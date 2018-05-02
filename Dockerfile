FROM node

# RUN npm install -g create-react-app
# RUN create-react-app sozzler
# RUN rm -f my-app/src/*

RUN yarn add react react-dom semantic-ui-react semantic-ui-css react-helmet react-router-dom slug

WORKDIR /sozzler/

CMD yarn start