FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos del workspace desde la raíz
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json ./frontend/

RUN pnpm install --frozen-lockfile

COPY frontend/ ./frontend/

WORKDIR /app/frontend

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start"]