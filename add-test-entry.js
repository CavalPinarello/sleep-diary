const { PrismaClient } = require('./src/generated/prisma');

async function addTestEntry() {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_8KXRnqimS7ZN@ep-patient-band-adr2yt5z-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
  
  const prisma = new PrismaClient();
  
  try {
    console.log("Adding test entry to database...\n");
    
    const entry = await prisma.sleepEntry.create({
      data: {
        userId: "test-user",
        date: new Date(),
        bedTime: new Date("2024-12-29T23:00:00"),
        wakeTime: new Date("2024-12-30T07:00:00"),
        sleepQuality: 8,
        notes: "Test entry from local script",
      },
    });
    
    console.log("✅ Test entry added successfully!");
    console.log("Entry ID:", entry.id);
    console.log("\nNow check your app's dashboard to see if this entry appears!");
    
  } catch (error) {
    console.error("❌ Error adding entry:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addTestEntry();