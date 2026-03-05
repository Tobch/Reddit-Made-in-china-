# Use a lightweight version of Node.js
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy all your backend code into the container
COPY . .

# Expose the port your server.js uses
EXPOSE 5000

# The command to start your backend
CMD ["npm", "start"]