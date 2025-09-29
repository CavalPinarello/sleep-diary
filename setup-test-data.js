const { PrismaClient } = require('./src/generated/prisma');

async function setupTestData() {
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_8KXRnqimS7ZN@ep-patient-band-adr2yt5z-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require";
  
  const prisma = new PrismaClient();
  
  try {
    console.log("Setting up test data...\n");
    
    // First, create a test user
    let user = await prisma.user.findFirst({
      where: { email: "test@example.com" }
    });
    
    if (!user) {
      console.log("Creating test user...");
      user = await prisma.user.create({
        data: {
          email: "test@example.com",
          name: "Test User",
        },
      });
      console.log("✅ Test user created:", user.id);
    } else {
      console.log("Test user already exists:", user.id);
    }
    
    // Now create a sleep entry for this user
    console.log("\nAdding sleep entry...");
    const entry = await prisma.sleepEntry.create({
      data: {
        userId: user.id,
        date: new Date(),
        bedTime: new Date("2024-12-29T23:00:00"),
        wakeTime: new Date("2024-12-30T07:00:00"),
        sleepQuality: 8,
        notes: "Test entry - had a great night's sleep!",
      },
    });
    
    console.log("✅ Sleep entry added successfully!");
    console.log("Entry ID:", entry.id);
    
    // Show all entries
    console.log("\n📊 All entries in database:");
    const allEntries = await prisma.sleepEntry.findMany({
      include: { user: true }
    });
    
    allEntries.forEach((e, i) => {
      console.log(`\nEntry ${i + 1}:`);
      console.log(`  User: ${e.user.name} (${e.user.email})`);
      console.log(`  Date: ${e.date.toLocaleDateString()}`);
      console.log(`  Sleep Quality: ${e.sleepQuality}/10`);
      console.log(`  Notes: ${e.notes}`);
    });
    
    console.log("\n🎯 Now check your live app at https://sleep-diary-one.vercel.app");
    console.log("The dashboard should show this entry!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();