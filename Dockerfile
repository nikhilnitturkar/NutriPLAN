# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies with newer npm syntax
RUN npm ci --omit=dev --legacy-peer-deps
RUN cd client && npm ci --omit=dev --legacy-peer-deps

# Copy source code
COPY . .

# Build the React app
RUN cd client && npm run build

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

# Start the application
CMD ["npm", "start"] 