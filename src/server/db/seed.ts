import "dotenv/config"; 
import { hashPassword } from "better-auth/crypto"; // Changed to Better Auth utility
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { generateId } from "../lib/ids";
import { generateVoterCardId } from "../services/voter-id.service";

const ADMINS = [
  {
    name: "Super Admin",
    email: "admin@yourdomain.com",
    password: "ChangeMe@123", 
  },
];

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client, { schema });

  console.log("🌱 Starting admin seed...\n");

  for (const admin of ADMINS) {
    const existing = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, admin.email),
    });

    if (existing) {
      console.log(`⚠️  Skipped  → ${admin.email} (already exists)`);
      continue;
    }

    // Use Better Auth's internal hashing
    const passwordHash = await hashPassword(admin.password);

    const userId = generateId("usr");
    const voterCardId = await generateVoterCardId(db);

    await db.insert(schema.user).values({
      id: userId,
      name: admin.name,
      email: admin.email,
      emailVerified: true,
      role: "admin",
      voterCardId,
      mobileVerified: false,
      secretQuestionsSet: false,
      faceEnrolled: false,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(schema.account).values({
      id: generateId(),
      accountId: admin.email, // CRITICAL: Must be the email for credential provider
      providerId: "credential",
      userId,
      password: passwordHash, // Correct hash format
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Created  → ${admin.email}`);
  }

  console.log("\n✅ Seed complete.");
  
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});