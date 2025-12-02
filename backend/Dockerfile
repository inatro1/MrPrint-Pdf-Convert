FROM node:18-bullseye
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "src/index.js"]
