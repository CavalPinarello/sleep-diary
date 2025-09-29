// Test OAuth Configuration
console.log("Testing OAuth Configuration...\n");

const config = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "929166874469-en7bccbo56pbei42k5a6o84lrd8nekvr.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "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",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000"
};

console.log("Configuration:");
console.log("==============");
console.log(`Client ID: ${config.GOOGLE_CLIENT_ID}`);
console.log(`Client Secret: ${config.GOOGLE_CLIENT_SECRET.substring(0, 10)}...`);
console.log(`NextAuth URL: ${config.NEXTAUTH_URL}`);
console.log(`\nCallback URL: ${config.NEXTAUTH_URL}/api/auth/callback/google`);

console.log("\n\nPlease verify in Google Cloud Console:");
console.log("========================================");
console.log("1. Go to: https://console.cloud.google.com/apis/credentials");
console.log("2. Click on your OAuth 2.0 Client ID");
console.log("3. Verify these match:");
console.log(`   - Client ID ends with: ...${config.GOOGLE_CLIENT_ID.slice(-20)}`);
console.log(`   - Client Secret starts with: ${config.GOOGLE_CLIENT_SECRET.substring(0, 10)}...`);
console.log("\n4. In 'Authorized redirect URIs', make sure you have:");
console.log(`   - ${config.NEXTAUTH_URL}/api/auth/callback/google`);
console.log("\n5. Check OAuth consent screen is configured and in 'Testing' or 'Production' mode");