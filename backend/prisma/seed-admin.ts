import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@test.by';
  const username = 'admin';
  const plainPassword = '123456';

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    console.log('Админ уже существует');
    return;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      role: Role.ADMIN,

    },
  });

  console.log('Admin created:', {
    id: user.id,
    email: user.email,
    username: user.username,
    password: plainPassword,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });