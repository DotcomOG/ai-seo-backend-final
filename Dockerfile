# Use Node 18 base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm install

# Expose port 8080 to match server.js
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]