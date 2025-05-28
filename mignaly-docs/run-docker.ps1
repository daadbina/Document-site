# Build and start the Docker containers
Write-Host "Building and starting Docker containers..." -ForegroundColor Green
docker-compose up -d --build

# Wait for the containers to start
Write-Host "Waiting for containers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if the containers are running
Write-Host "Checking container status..." -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "Mignaly Documentation Platform is now running at http://localhost:3000" -ForegroundColor Green
Write-Host "Admin credentials:" -ForegroundColor Green
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White