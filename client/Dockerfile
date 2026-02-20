ARG NGINX_VERSION=1.25.3 # Declare ARG at the very top for global scope
# Stage 1: Build the Angular application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package.json and lock file first for monorepo context
COPY package.json package-lock.json ./

# Copy client specific package.json and lock file
COPY client/package.json client/package-lock.json ./client/

# Install all dependencies (for both root and workspaces)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Angular application
WORKDIR /app/client
RUN npm run build
# Stage 2: Serve the Angular application with Nginx
FROM nginx:${NGINX_VERSION}-alpine

# Remove default Nginx welcome page and other content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular application from the builder stage
COPY --from=builder /app/client/dist/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]