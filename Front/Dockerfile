# syntax=docker/dockerfile:1

# ---- Base Stage ----
FROM node:20-alpine AS base

# Variables de build (disponibles au build time)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (dev deps needed for build)
RUN npm install

# Copy source files
COPY . .

# ---- Build Stage ----
FROM base AS builder

# Build the Next.js application
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets and node_modules from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Expose the port Next.js runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Command to run the production server
CMD ["npm", "start"]
