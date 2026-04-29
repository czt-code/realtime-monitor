# ---- 前端构建阶段 ----
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- 后端运行阶段 ----
FROM node:20-alpine
WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY server/index.js ./
COPY --from=client-builder /app/client/dist ./public

EXPOSE 3001

ENV PORT=3001
ENV NODE_ENV=production

CMD ["node", "index.js"]
