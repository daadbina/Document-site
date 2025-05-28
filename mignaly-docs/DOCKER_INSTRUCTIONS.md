# Docker Setup Instructions for Mignaly Documentation Platform

This document provides detailed instructions on how to run the Mignaly Documentation Platform using Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

## Running the Application

### Option 1: Using Docker Compose directly

1. Open a terminal/command prompt
2. Navigate to the project directory
3. Run the following command:

```bash
docker-compose up -d
```

4. Wait for the containers to start
5. Access the application at http://localhost:3000

### Option 2: Using the provided scripts

#### On Windows:

1. Open PowerShell
2. Navigate to the project directory
3. Run the following command:

```powershell
.\run-docker.ps1
```

#### On Linux/Mac:

1. Open Terminal
2. Navigate to the project directory
3. Make the script executable:

```bash
chmod +x run-docker.sh
```

4. Run the script:

```bash
./run-docker.sh
```

## Stopping the Application

To stop the application, run:

```bash
docker-compose down
```

## Viewing Logs

To view the logs of the running containers:

```bash
docker-compose logs -f
```

## Admin Access

Once the application is running, you can access the admin panel with the following credentials:

- URL: http://localhost:3000/login
- Email: admin@example.com
- Password: admin123

## Troubleshooting

### Container not starting

If the containers fail to start, check the logs:

```bash
docker-compose logs
```

### Database connection issues

If the application cannot connect to the database, ensure the MongoDB container is running:

```bash
docker ps | grep mongodb
```

### Rebuilding the containers

If you need to rebuild the containers after making changes:

```bash
docker-compose up -d --build
```

### Resetting the database

If you need to reset the database:

```bash
docker-compose down -v
docker-compose up -d
```