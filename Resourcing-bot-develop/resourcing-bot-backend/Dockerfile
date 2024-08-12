# Use a base image with Node.js pre-installed
FROM node:18


# Install redis-cli
RUN apt-get update && apt-get install -y redis-tools

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port used by the Node.js application
EXPOSE 3001 3003


# Start the Node.js server
CMD ["npm", "start"]
