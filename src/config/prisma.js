import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$connect()
    .then(() => {
        console.log('Successfully connected to the database');
    })
    .catch((error) => {
        console.error('Failed to connect to the database:', error);
    });

export default prisma; 