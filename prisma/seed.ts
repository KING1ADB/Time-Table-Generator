import { PrismaClient, Role, SchoolType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Super Admin
  const adminPassword = await hash('AdminPass123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@timetabler.cm' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@timetabler.cm',
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // Create Sample Cameroonian Secondary School
  const school = await prisma.school.upsert({
    where: { code: 'MBOA-01' },
    update: {},
    create: {
      name: 'Mboa Bilingual College',
      code: 'MBOA-01',
      type: SchoolType.BILINGUAL,
      address: 'Yaoundé, Cameroon',
    },
  });

  // Create School Admin
  const schoolAdminPassword = await hash('SchoolPass123!', 10);
  await prisma.user.upsert({
    where: { email: 'principal@mboacollege.cm' },
    update: {},
    create: {
      name: 'Principal Mboa',
      email: 'principal@mboacollege.cm',
      passwordHash: schoolAdminPassword,
      role: Role.SCHOOL_ADMIN,
      schoolId: school.id,
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
