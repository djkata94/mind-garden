// Shared drizzle client (Neon Postgres over pooled connection).
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

function getClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set (see .env.example).");
  }
  // prepare: false is required for pooled (pgbouncer transaction mode) URLs.
  return postgres(process.env.DATABASE_URL, { ssl: "require", prepare: false });
}

export const db = drizzle(getClient(), { schema });
