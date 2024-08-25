# syntax = docker/dockerfile:1.2

# Step 1: Use an official Node.js runtime as a parent image
FROM node:18-alpine AS builder

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json files
COPY package*.json ./


# Step 4: Install dependencies
RUN npm install

# Step 5: Copy the Prisma schema file
COPY prisma/schema.prisma ./prisma/

# Step 6: Generate prisma client
RUN npx prisma generate

# Step 7: Copy key files and other necessary files
COPY keys/ ./keys/
COPY . .

# Step 8: Generate Keys
RUN npm run gen-key

# Step 9: Build the NestJS application
RUN npm run build

# Step 10: Remove development dependencies
RUN npm prune --production

# Step 11: Use a smaller base image for production
FROM node:18-alpine AS runner

# Step 12: Set the working directory
WORKDIR /app

# Step 13: Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/keys ./keys
COPY --from=builder /app/prisma ./prisma
# COPY --from=builder /app/.env.production ./

# Step 14: Expose the port the app runs on
EXPOSE 3000


# Step 15: Run the key generation and start the app
CMD ["sh", "-c", "node dist/keys/generateKeys.js && node dist/src/main.js"]

# Optional: Set environment variables (uncomment if needed)
ENV NODE_ENV=production
ENV PORT=3000
