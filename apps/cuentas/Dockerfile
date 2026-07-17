FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY . .

RUN npx nest build cuentas

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY proto ./proto
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/apps/cuentas/main.js"]
