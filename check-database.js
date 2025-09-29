const { PrismaClient } = require('./src/generated/prisma');

async function checkDatabase() {
  // Set the DATABASE_URL
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_8KXRnqimS7ZN@ep-patient-band-adr2yt5z-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
  
  const prisma = new PrismaClient();
  
  try {
    console.log("Connecting to Neon database...\n");
    
    // Count entries
    const count = await prisma.sleepEntry.count();
    console.log(`Total sleep entries in database: ${count}\n`);
    
    // Get all entries
    const entries = await prisma.sleepEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    if (entries.length > 0) {
      console.log("Sleep Entries:");
      console.log("==============");
      entries.forEach((entry, index) => {
        console.log(`\nEntry ${index + 1}:`);
        console.log(`  ID: ${entry.id}`);
        console.log(`  User: ${entry.userId}`);
        console.log(`  Date: ${entry.date}`);
        console.log(`  Bed Time: ${entry.bedTime}`);
        console.log(`  Wake Time: ${entry.wakeTime}`);
        console.log(`  Quality: ${entry.sleepQuality}/10`);
        console.log(`  Notes: ${entry.notes || 'No notes'}`);
        console.log(`  Created: ${entry.createdAt}`);
      });
    } else {
      console.log("No sleep entries found in the database.");
      console.log("\nThis means either:");
      console.log("1. No entries have been saved yet");
      console.log("2. The app might not be saving to the database correctly");
    }
    
    // Check if database is accessible
    console.log("\n✅ Database connection successful!");
    
  } catch (error) {
    console.error("❌ Error connecting to database:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();