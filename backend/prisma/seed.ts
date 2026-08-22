/**
 * Database Seed Script
 * Populates the database with sample vehicles and an admin user.
 *
 * Run with: npx ts-node prisma/seed.ts
 * Or:       npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding database...');

  // ── Admin User ─────────────────────────────────────────────────────────────
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@cardealership.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123', 10);
    await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@cardealership.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created: admin@cardealership.com / Admin123');
  } else {
    console.log('ℹ️  Admin user already exists — skipping');
  }

  // ── Sample Vehicles ────────────────────────────────────────────────────────
  const existingCount = await prisma.vehicle.count();

  if (existingCount > 0) {
    console.log(`ℹ️  ${existingCount} vehicles already exist — skipping vehicle seed`);
  } else {
    await prisma.vehicle.createMany({
      data: [
        {
          make: 'Toyota',
          model: 'Camry',
          category: 'Sedan',
          price: 25000.00,
          quantity: 8,
        },
        {
          make: 'Toyota',
          model: 'RAV4',
          category: 'SUV',
          price: 32000.00,
          quantity: 5,
        },
        {
          make: 'Honda',
          model: 'Civic',
          category: 'Sedan',
          price: 22000.00,
          quantity: 12,
        },
        {
          make: 'Honda',
          model: 'CR-V',
          category: 'SUV',
          price: 28000.00,
          quantity: 6,
        },
        {
          make: 'Ford',
          model: 'Mustang',
          category: 'Coupe',
          price: 45000.00,
          quantity: 3,
        },
        {
          make: 'Ford',
          model: 'F-150',
          category: 'Truck',
          price: 50000.00,
          quantity: 4,
        },
        {
          make: 'Tesla',
          model: 'Model 3',
          category: 'Electric',
          price: 42000.00,
          quantity: 7,
        },
        {
          make: 'Tesla',
          model: 'Model Y',
          category: 'Electric',
          price: 55000.00,
          quantity: 4,
        },
        {
          make: 'BMW',
          model: '3 Series',
          category: 'Sedan',
          price: 48000.00,
          quantity: 2,
        },
        {
          make: 'Mercedes',
          model: 'C-Class',
          category: 'Sedan',
          price: 52000.00,
          quantity: 2,
        },
        {
          make: 'Chevrolet',
          model: 'Silverado',
          category: 'Truck',
          price: 47000.00,
          quantity: 5,
        },
        {
          make: 'Nissan',
          model: 'Altima',
          category: 'Sedan',
          price: 24000.00,
          quantity: 0,
        },
      ],
    });
    console.log('✅ 12 sample vehicles created');
  }

  console.log('\n🎉 Seeding complete!\n');
  console.log('Admin login credentials:');
  console.log('  Email:    admin@cardealership.com');
  console.log('  Password: Admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
