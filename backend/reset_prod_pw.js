require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash('12345678', 10);
  const user = await p.user.upsert({
    where: { email: 'nathanspace.co@gmail.com' },
    update: { password: hash, role: 'ADMIN' },
    create: {
      name: 'Nathan Chandra',
      email: 'nathanspace.co@gmail.com',
      password: hash,
      role: 'ADMIN',
    },
  });
  console.log('Done:', user.email, 'role:', user.role);
  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
