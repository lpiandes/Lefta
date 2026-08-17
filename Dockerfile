FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build:shared && npm run build -w @find-money/api
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "apps/api/dist/index.js"]
