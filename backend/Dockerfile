FROM node:lts-slim

WORKDIR /app

RUN npm i -g pnpm

RUN corepack enable

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 3002

CMD ["pnpm", "prod"]
