# Use the official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

# Change ownership of the app directory
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose the port the app runs on
EXPOSE 5003

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:5003/ || exit 1

# Define the command to run the application
CMD ["npm", "start"]