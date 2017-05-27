# Create image based on the official Node 6 image from dockerhub
FROM node:7

# Create a directory where our app will be placed
# RUN mkdir -p /usr/src/app

# Install dependecies
RUN npm install

# Add a /app volume
VOLUME ["/app"]

# Change directory so that our commands run inside this new directory
WORKDIR /app

# Copy dependency definitions
# COPY package.json /usr/src/app

# Get all the code needed to run the app
#COPY . /usr/src/app

# Expose the port the app runs in
EXPOSE 4200

# Serve the app
CMD ["npm", "start"]
