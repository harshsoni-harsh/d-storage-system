FROM node:lts-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm i -g pnpm

RUN pnpm install

COPY . .

RUN pnpm hardhat compile

EXPOSE 8545

CMD ["pnpm", "hardhat", "node"]
