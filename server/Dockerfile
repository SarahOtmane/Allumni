# Utilisation de Debian Slim pour une stabilité maximale avec Puppeteer
FROM node:18-slim AS builder

# Installation des dépendances pour Chromium sur Debian
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    tini \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Configuration Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Gestion du monorepo
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN npm install

# Copie du reste du code et build
COPY . .
WORKDIR /app/server
RUN npm run build

# Entrypoint pour gérer les processus zombies
ENTRYPOINT ["/usr/bin/tini", "--"]

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
