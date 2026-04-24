FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma/
COPY src ./src/

RUN npx prisma generate
RUN mkdir -p screenshots

EXPOSE 3000
EXPOSE 8080

CMD ["npx", "tsx", "src/server.ts"]
