import { hash } from "@node-rs/argon2";
import { drizzle } from "drizzle-orm/postgres-js"; // Changed import
import postgres from "postgres";                  // Changed import

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
  // Use postgres-js client instead of pg Pool
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

    const passwordHash = await hash(admin.password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    const userId = generateId();
    
    // This now receives the correct database type
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
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`✅ Created  → ${admin.email}`);
  }

  console.log("\n✅ Seed complete.");
  
  // Close the connection properly
  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});