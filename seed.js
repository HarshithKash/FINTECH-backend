const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding 10 professional financial records...");

  // 1. Clear existing records to avoid duplicates during testing
  await prisma.financialRecord.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create standard users
  await prisma.user.createMany({
    data: [
      { name: 'Admin One', email: 'admin@zorvyn.com', role: 'admin', status: 'active' },
      { name: 'Data Analyst', email: 'analyst@zorvyn.com', role: 'analyst', status: 'active' },
      { name: 'System Viewer', email: 'viewer@zorvyn.com', role: 'viewer', status: 'active' },
    ],
  });

  // 3. Create 10 diverse records
  await prisma.financialRecord.createMany({
    data: [
      { amount: 15500, type: 'income', category: 'Project Fee', notes: 'API Development Contract' },
      { amount: 4500, type: 'expense', category: 'Infrastructure', notes: 'Monthly AWS Bill' },
      { amount: 3200, type: 'income', category: 'Investment', notes: 'Quarterly Dividends' },
      { amount: 1200, type: 'expense', category: 'Marketing', notes: 'Social Media Ads' },
      { amount: 7500, type: 'income', category: 'Consulting', notes: 'Security Audit' },
      { amount: 500, type: 'expense', category: 'Software', notes: 'SaaS Subscriptions' },
      { amount: 2000, type: 'expense', category: 'Rent', notes: 'Coworking Space' },
      { amount: 4800, type: 'income', category: 'License', notes: 'Software License Sale' },
      { amount: 900, type: 'expense', category: 'Hardware', notes: 'Replacement Keyboard' },
      { amount: 1500, type: 'income', category: 'Bonus', notes: 'Performance Reward' },
    ],
  });

  console.log("Seeding complete: 10 Records & 3 Users created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
