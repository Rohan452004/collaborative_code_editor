# ------------------- Stage 1: Build Stage ------------------------------
FROM node:21 AS server-builder

# setup the working dir
WORKDIR /app

COPY package*.json ./

# packages install
RUN npm i

# code
COPY . .

# Build TypeScript into JS
RUN npm run build

# ------------------- Stage 2: Final Stage ------------------------------
FROM node:21-slim

# setup the working dir
WORKDIR /app

# copy the above stage as compressed
COPY --from=server-builder /app .

# Port
EXPOSE 5001

# App
CMD ["node", "dist/server.js"]
