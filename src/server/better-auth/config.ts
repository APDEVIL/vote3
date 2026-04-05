import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { env } from "@/env";
import { db } from "@/server/db";
import * as authSchema from "@/server/db/schema"; // Added schema import

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
        schema: {
            user: authSchema.user,
            session: authSchema.session,
            account: authSchema.account,
            verification: authSchema.verification,
        },
    }),
    // ── ADDED THIS SECTION ─────────────────────────────────────────────────
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "voter",
            },
        },
    },
    session: {
        additionalFields: {
            role: {
                type: "string",
            },
        },
    },
    // ───────────────────────────────────────────────────────────────────────
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
            clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
            redirectURI: "http://localhost:3000/api/auth/callback/github",
        },
    },
});

export type Session = typeof auth.$Infer.Session;