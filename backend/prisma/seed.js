const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            permissions: ['ALL'],
        },
    });

    const cashierRole = await prisma.role.upsert({
        where: { name: 'CASHIER' },
        update: {},
        create: {
            name: 'CASHIER',
            permissions: ['SALES', 'CLIENTS'],
        },
    });

    const supervisorRole = await prisma.role.upsert({
        where: { name: 'SUPERVISOR' },
        update: {},
        create: {
            name: 'SUPERVISOR',
            permissions: ['SALES', 'CLIENTS', 'REPORTS'],
        },
    });

    const inventoryRole = await prisma.role.upsert({
        where: { name: 'INVENTORY' },
        update: {},
        create: {
            name: 'INVENTORY',
            permissions: ['PRODUCTS', 'INVENTORY'],
        },
    });

    // Create Super Admin User (username: jeanvial, password: Tessi1308)
    const hashedPassword = await bcrypt.hash('Tessi1308', 10);

    await prisma.user.upsert({
        where: { email: 'jeanvial' },
        update: {},
        create: {
            email: 'jeanvial',
            password: hashedPassword,
            name: 'Jean Vial',
            roleId: adminRole.id,
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log('📝 Super User: jeanvial / Tessi1308');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
