import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Copy backend/.env.example to backend/.env and configure it.');
}

const poolMax = Number.parseInt(process.env.DB_POOL_MAX ?? '10', 10);

const pool = new Pool({
  connectionString,
  max: Number.isInteger(poolMax) && poolMax > 0 ? poolMax : 10,
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
export default prisma;
