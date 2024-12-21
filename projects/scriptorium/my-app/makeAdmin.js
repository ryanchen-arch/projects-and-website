// scripts/createAdminUser.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'admin@example.com'; // Admin email
  const password = 'yourAdminPassword'; // Admin password
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

  try {
    // Check if the admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      },
    });

    console.log('Admin user created successfully:', adminUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect(); // Ensure the Prisma client is disconnected
  }
}

createAdminUser();
