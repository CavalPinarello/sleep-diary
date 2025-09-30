const { PrismaClient } = require('./src/generated/prisma');

async function checkUsers() {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_8KXRnqimS7ZN@ep-patient-band-adr2yt5z-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
  
  const prisma = new PrismaClient();
  
  try {
    console.log("Checking users in database...\n");
    
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { sleepEntries: true }
        }
      }
    });
    
    console.log(`Total users: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Name: ${user.name || 'N/A'}`);
      console.log(`  Email: ${user.email || 'N/A'}`);
      console.log(`  Sleep Entries: ${user._count.sleepEntries}`);
      console.log('');
    });
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();