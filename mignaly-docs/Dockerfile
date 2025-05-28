FROM node:18-alpine AS base

# Install dependencies for Puppeteer and OpenSSL for Prisma
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn \
    openssl \
    openssl-dev

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create .env file with database URL and other environment variables
RUN echo "DATABASE_URL=mongodb://mongodb:27050/mignaly" > .env
RUN echo "NEXTAUTH_SECRET=your-secret-key-here" >> .env
RUN echo "NEXTAUTH_URL=http://localhost:3434" >> .env
RUN echo "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true" >> .env
RUN echo "PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser" >> .env

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/.env ./

USER nextjs

EXPOSE 3434

ENV PORT 3434
ENV HOSTNAME "0.0.0.0"

# Add the command to run Prisma migrations
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]