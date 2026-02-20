# Stage 1: Build the NestJS application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package.json and lock file first for monorepo context
COPY package.json package-lock.json ./

# Copy server specific package.json and lock file
COPY server/package.json server/package-lock.json ./server/

# Install all dependencies (for both root and workspaces)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the NestJS application (assuming it's in the 'server' directory)
WORKDIR /app/server
RUN npm run build

# Stage 2: Run the NestJS application
FROM node:18-alpine AS runner

WORKDIR /app

# Install Puppeteer dependencies
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

# Skip downloading Chromium since we installed it via apk
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy root package.json and lock file for runtime
COPY package.json package-lock.json ./

# Copy server specific package.json and lock file for runtime
COPY server/package.json server/package-lock.json ./server/

# Install only production dependencies for all workspaces
RUN npm install --only=production

# Copy the built application from the builder stage
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/server/.env ./server/.env

# Expose the port the NestJS app listens on
EXPOSE 3000

# Command to run the NestJS application
CMD ["node", "server/dist/main"]