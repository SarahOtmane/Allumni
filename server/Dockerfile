# Stage 1: Build the NestJS application
FROM node:18-alpine AS builder

WORKDIR /app

# Install Chromium for Puppeteer (needed for scraping)
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy root package files
COPY package.json package-lock.json ./

# Copy server specific package.json ONLY
COPY server/package.json ./server/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the NestJS application
WORKDIR /app/server
RUN npm run build

# Stage 2: Run the NestJS application
FROM node:18-alpine AS runner

WORKDIR /app

# Install Chromium in runner too
RUN apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy root and server package files
COPY package.json package-lock.json ./
COPY server/package.json ./server/

# Install production dependencies
RUN npm install --only=production

# Copy built app
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/.env ./server/.env

EXPOSE 3000

CMD ["node", "server/dist/main"]
