#!/bin/bash

# Build and start the Docker containers
echo "Building and starting Docker containers..."
docker-compose up -d --build

# Wait for the containers to start
echo "Waiting for containers to start..."
sleep 10

# Check if the containers are running
echo "Checking container status..."
docker-compose ps

echo ""
echo "Mignaly Documentation Platform is now running at http://localhost:3000"
echo "Admin credentials:"
echo "  Email: admin@example.com"
echo "  Password: admin123"