FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN NODE_OPTIONS="--max-old-space-size=4096" npx nx run webapp:build
ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "./dist/packages/webapp/server.cjs"]
