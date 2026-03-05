# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy built app from build stage
COPY --from=build /app/build ./build

# Expose the port
EXPOSE 3000

# Run the app
CMD ["serve", "-s", "build", "-l", "3000"]
