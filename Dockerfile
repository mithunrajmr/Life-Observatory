# Multi-stage Dockerfile for Life Observatory on Google Cloud Run
# Challenge Label: dev-tutorial=cloud-run-ai-challenge

# ------------------------------------------------------------------------------
# Stage 1: Build Client Frontend
# ------------------------------------------------------------------------------
FROM node:22-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Build Server Backend
# ------------------------------------------------------------------------------
FROM node:22-alpine AS server-builder
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci

COPY server/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Production Runtime
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

LABEL dev-tutorial="cloud-run-ai-challenge"

ENV NODE_ENV=production
ENV PORT=8080
ENV CLIENT_DIST_PATH=../client/dist

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# Copy compiled backend
COPY --from=server-builder /app/server/dist ./server/dist

# Copy compiled frontend
COPY --from=client-builder /app/client/dist ./client/dist

WORKDIR /app/server

EXPOSE 8080

CMD ["node", "dist/index.js"]
