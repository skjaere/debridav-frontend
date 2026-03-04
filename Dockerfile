# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build \
 && npx esbuild server/index.ts --outfile=server/index.js --platform=node --format=esm --packages=external

# Production stage
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/index.js ./server/
COPY package*.json ./
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["node", "server/index.js"]
