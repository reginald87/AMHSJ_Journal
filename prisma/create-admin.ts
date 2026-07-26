import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@amhsj.org';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error('ADMIN_PASSWORD environment variable is required.');
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        firstName: 'Admin',
        lastName: 'User',
        emailVerified: new Date(),
      },
    });
    console.log('Admin user updated.');
  } else {
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        firstName: 'Admin',
        lastName: 'User',
        emailVerified: new Date(),
      },
    });
    console.log('Admin user created.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
