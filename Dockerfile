# Dockerfile

# build environment
FROM node:18.17.0-alpine AS build
WORKDIR /app
COPY package* ./
RUN npm install
RUN npm install -D
COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]