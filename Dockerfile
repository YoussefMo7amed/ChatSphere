# Use the official Node.js 20 Alpine image as the base
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /project/src

# Copy package.json and package-lock.json first
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY src/ ./

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npx", "nodemon", "./index.js"]
