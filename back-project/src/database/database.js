// Prisma version (drop-in replacement del connectDB de Mongoose)
const { PrismaClient } = require('../generated/prisma');
require('dotenv').config();

let prisma = global.__PRISMA__ || new PrismaClient();
global.__PRISMA__ = prisma;

let connectPromise = global.__PRISMA_CONNECT_PROMISE__;

const connectDB = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.warn('DATABASE_URL no está definida. Omitiendo conexión a PostgreSQL.');
    return null;
  }
  if (connectPromise) return connectPromise;

  connectPromise = prisma.$connect()
    .then(async () => {
      // ping rápido, no requiere tablas
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ PostgreSQL conectado vía Prisma');
      return prisma;
    })
    .catch(err => {
      console.error('❌ Error conectando a PostgreSQL:', err?.message || err);
      return null; // no lanzamos, dejamos viva la app
    });

  global.__PRISMA_CONNECT_PROMISE__ = connectPromise;

  // Cierre limpio
  const safeExit = async () => { try { await prisma.$disconnect(); } finally { process.exit(0); } };
  process.on('SIGINT', safeExit);
  process.on('SIGTERM', safeExit);

  return connectPromise;
};

module.exports = connectDB;
module.exports.getPrisma = () => prisma;