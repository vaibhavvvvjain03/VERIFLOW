# Use official Playwright image matching installed version
FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Ensure matching Chromium browser binaries are installed
RUN npx playwright install chromium

# Copy application source code
COPY . .

# Build production React frontend into dist/
RUN npm run build

# Ensure runs directory exists with proper write permissions for artifacts
RUN mkdir -p runs/artifacts && chmod -R 777 runs

# Environment configuration
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Start unified production server
CMD ["npm", "start"]
