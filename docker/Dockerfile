FROM node:14
WORKDIR /usr/src/app
RUN npm install express@4.17.1 body-parser@1.19.0 node-fetch@2.6.1
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
