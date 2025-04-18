# Use Node 18 as base
FROM node:18

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]