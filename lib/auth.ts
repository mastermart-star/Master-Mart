import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import { env } from "@/core/config/env";

// Better Auth needs a native MongoClient, not a Mongoose connection.
// A second pool against the same URL is fine and keeps init order simple.
const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };
const client = globalForMongo.mongoClient ?? new MongoClient(env.MONGODB_URL);
if (env.NODE_ENV !== "production") globalForMongo.mongoClient = client;

export const auth = betterAuth({
  database: mongodbAdapter(client.db()),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      // input: false => can never be set from a signup payload.
      role: { type: "string", required: true, defaultValue: "user", input: false },
    },
  },
  // nextCookies() MUST be last, or cookies set inside Server Actions are dropped.
  plugins: [nextCookies()],
});
