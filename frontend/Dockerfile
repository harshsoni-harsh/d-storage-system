FROM node:lts-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml ./

RUN npm i -g pnpm

RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
