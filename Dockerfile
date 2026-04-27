# Multi-stage Dockerfile for ZenPayroll AI
# 1. Build Stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. Production Stage
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/server/ ./server/
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
RUN npm install -g tsx

EXPOSE 3000
CMD ["tsx", "server.ts"]
