// Create the admin user
db = db.getSiblingDB('mignaly');

// Create collections
db.createCollection('users');
db.createCollection('documents');
db.createCollection('documentVersions');
db.createCollection('categories');
db.createCollection('tags');
db.createCollection('comments');

// Create admin user
const bcrypt = require('bcryptjs');
const hashedPassword = '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm'; // admin123

db.users.insertOne({
  name: 'Admin User',
  email: 'admin@example.com',
  password: hashedPassword,
  role: 'ADMIN',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create sample categories
db.categories.insertMany([
  {
    name: 'Getting Started',
    slug: 'getting-started',
    description: 'Everything you need to know to get started with our platform',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Guides',
    slug: 'guides',
    description: 'Step-by-step guides for common tasks',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'API Reference',
    slug: 'api-reference',
    description: 'Detailed API documentation for developers',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);