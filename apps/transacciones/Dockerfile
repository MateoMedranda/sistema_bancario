FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY . .

RUN npx nest build transacciones

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist/apps/transacciones ./dist/apps/transacciones
# También es posible que necesite librerías compartidas si existieran, pero en Nest CLI por defecto se agrupa o se mantienen en dist/libs.
# Para evitar problemas con imports absolutos (como tsconfig paths), se recomienda copiar todo el dist:
# COPY --from=builder /app/dist ./dist

# Sin embargo, como el webpack puede estar activado para microservicios, quizás el main.js tenga todo.
# Copiamos todo el dist por si acaso.
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/apps/transacciones/main.js"]
