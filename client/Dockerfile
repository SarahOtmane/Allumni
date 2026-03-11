ARG NGINX_VERSION=1.25.3
# Stage 1: Build the Angular application
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies for headless Chrome
RUN apk add --no-cache chromium nss freetype freetype-dev harfbuzz ca-certificates ttf-freefont

# Set Chrome binary path for Angular tests
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PATH /app/node_modules/.bin:$PATH

# Copy root package files
COPY package.json package-lock.json ./

# Copy client specific package.json ONLY (lock file is at root)
COPY client/package.json ./client/

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Angular application
WORKDIR /app/client
RUN npm run build

# Stage 2: Serve the Angular application with Nginx
FROM nginx:${NGINX_VERSION}-alpine

# Remove default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular application
COPY --from=builder /app/client/dist/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
