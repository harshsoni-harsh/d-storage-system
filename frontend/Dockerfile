FROM node:lts-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY . .

RUN npm i -g pnpm

RUN pnpm install

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
