# Mignaly Documentation Platform

A production-ready documentation platform with a dark theme, built with Next.js and MongoDB.

## Features

- 🌙 Dark mode support
- 📝 Rich text editor for content creation
- 🔍 Search functionality
- 📚 Version control for documents
- 💬 User comments and feedback
- 📄 PDF export
- 🔒 Authentication and authorization
- 🐳 Docker support for easy deployment

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running with Docker

1. Clone the repository
2. Navigate to the project directory
3. Build and start the containers:

```bash
docker-compose up -d
```

4. The application will be available at http://localhost:3000

### Default Admin Credentials

- Email: admin@example.com
- Password: admin123

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB

### Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
# Create a .env file with the following content
DATABASE_URL=mongodb://localhost:27017/mignaly
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Push the database schema:

```bash
npm run prisma:push
```

6. Seed the database:

```bash
npm run prisma:seed
```

7. Start the development server:

```bash
npm run dev
```

## Docker Commands

- Build the Docker image:

```bash
npm run docker:build
```

- Start the Docker containers:

```bash
npm run docker:up
```

- Stop the Docker containers:

```bash
npm run docker:down
```

## License

MIT