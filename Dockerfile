# --- Stage 1: Build ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package and configuration files for dependency resolution
COPY package.json ./

# Install project dependencies using npm
# We ignore scripts here because 'quasar prepare' (postinstall) requires almost all project files
RUN npm install --ignore-scripts

# Now copy the rest of the application code
COPY . .

# Build the Quasar project for production
# (The build command will handle necessary preparation)
RUN npm run build


# --- Stage 2: Serve ---
FROM node:22-alpine

WORKDIR /app

# Install lightweight servers globally
# - serve: to host the built SPA
# - json-server: to host the mock API
# - concurrently: to launch both in one container
RUN npm install -g serve json-server concurrently

# Copy only the necessary production-ready files
COPY --from=builder /app/dist/spa ./dist/spa
COPY --from=builder /app/payload.json ./

# Expose the application and API ports
EXPOSE 9000
EXPOSE 3001

# Start the services
# We use 'serve -s' to handle SPA client-side routing
# We use '--host 0.0.0.0' for json-server to ensure connectivity inside Docker
CMD ["concurrently", \
     "serve -s dist/spa -l 9000", \
     "json-server --watch payload.json --port 3001 --host 0.0.0.0" \
    ]
