import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcryptjs from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'prueba@gmail.com';
  const hashedPassword = bcryptjs.hashSync('prueba', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Administrador Inicial',
      password: hashedPassword,
      role: Role.Admin,
      isActive: true,
    },
  });

  console.log(`Seed completed successfully: Admin user ready (${admin.email})`);
}

main()
  .catch((e) => {
    console.error('Error executing seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
