import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      username: 'admin',
      fullName: 'System Admin',
      phone: '+375000000000',
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'System Admin',
      phone: '+375000000000',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Admin seeded');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });