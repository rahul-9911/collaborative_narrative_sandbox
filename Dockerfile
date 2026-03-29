# Stage 1: Build the React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
# Copy only package files first to leverage Docker cache
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the final StoryForge Monolith
FROM node:20-slim
WORKDIR /usr/src/app

# Copy backend package files and install production-only dependencies
COPY package*.json ./
RUN npm install --production

# Copy the pre-built frontend from the builder stage
# (Vite is configured to output to ../public, which is /app/public in the builder)
COPY --from=frontend-builder /app/public ./public

# Copy the rest of the backend source code
COPY . .

# Expose the application port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the StoryForge server
CMD [ "node", "src/index.js" ]
