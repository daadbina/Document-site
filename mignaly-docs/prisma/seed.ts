import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user if it doesn't exist
  const adminExists = await prisma.user.findUnique({
    where: {
      email: 'admin@example.com',
    },
  })

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })
    
    console.log('Admin user created')
  }

  // Create categories if they don't exist
  const categories = [
    {
      name: 'Getting Started',
      slug: 'getting-started',
      description: 'Everything you need to know to get started with our platform',
    },
    {
      name: 'Guides',
      slug: 'guides',
      description: 'Step-by-step guides for common tasks',
    },
    {
      name: 'API Reference',
      slug: 'api-reference',
      description: 'Detailed API documentation for developers',
    },
  ]

  for (const category of categories) {
    const exists = await prisma.category.findUnique({
      where: {
        slug: category.slug,
      },
    })

    if (!exists) {
      await prisma.category.create({
        data: category,
      })
      
      console.log(`Category ${category.name} created`)
    }
  }

  // Create sample documents
  const sampleDocs = [
    {
      title: 'Getting Started with Mignaly',
      slug: 'getting-started',
      subtitle: 'Learn how to get started with our documentation platform',
      content: `
# Getting Started with Mignaly

Welcome to Mignaly! This guide will help you get started with using our documentation system.

## Installation

First, you'll need to install the required dependencies:

\`\`\`bash
npm install @mignaly/docs
\`\`\`

## Configuration

Create a configuration file in your project root:

\`\`\`javascript
// mignaly.config.js
module.exports = {
  title: 'My Documentation',
  description: 'Comprehensive documentation for my project',
  theme: 'dark',
  // Add more configuration options here
}
\`\`\`

## Usage

Now you can start creating your documentation:

1. Create a \`docs\` folder in your project
2. Add markdown files to the folder
3. Run the development server:

\`\`\`bash
npx mignaly dev
\`\`\`
      `,
      published: true,
      categorySlug: 'getting-started',
    },
    {
      title: 'API Reference',
      slug: 'api-reference',
      subtitle: 'Complete API documentation for developers',
      content: `
# API Reference

This is the API reference for Mignaly.

## Authentication

All API requests require authentication using a JWT token.

\`\`\`javascript
// Example API request
fetch('https://api.mignaly.com/documents', {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
\`\`\`

## Endpoints

### GET /documents

Returns a list of all documents.

### GET /documents/:slug

Returns a specific document by slug.

### POST /documents

Creates a new document.

### PUT /documents/:id

Updates an existing document.

### DELETE /documents/:id

Deletes a document.
      `,
      published: true,
      categorySlug: 'api-reference',
    },
  ]

  for (const doc of sampleDocs) {
    const exists = await prisma.document.findUnique({
      where: {
        slug: doc.slug,
      },
    })

    if (!exists) {
      // Get admin user
      const admin = await prisma.user.findUnique({
        where: {
          email: 'admin@example.com',
        },
      })

      if (!admin) continue

      // Get category
      const category = await prisma.category.findUnique({
        where: {
          slug: doc.categorySlug,
        },
      })

      await prisma.document.create({
        data: {
          title: doc.title,
          slug: doc.slug,
          subtitle: doc.subtitle,
          content: doc.content,
          published: doc.published,
          author: {
            connect: {
              id: admin.id,
            },
          },
          ...(category && {
            category: {
              connect: {
                id: category.id,
              },
            },
          }),
        },
      })
      
      console.log(`Document ${doc.title} created`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })