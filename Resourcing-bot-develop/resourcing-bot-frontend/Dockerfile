# Use a base image with Node.js pre-installed
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
# COPY package*.json ./

# Install npm dependencies
COPY . .
RUN npm install --legacy-peer-deps

# Copy the rest of the application code to the container

# Expose the port used by the React application
EXPOSE 3000

# Start the React development server
CMD ["npm", "start"]
