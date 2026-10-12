// Shared drizzle client (Neon Postgres over pooled connection).
// Lazy singleton: importing this module must never throw (builds and pages
// without DATABASE_URL still prerender their fallback states).
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

let client = null;

export function getDb() {
  if (!client) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set (see .env.example).");
    }
    // prepare: false is required for pooled (pgbouncer transaction mode) URLs.
    const sql = postgres(process.env.DATABASE_URL, {
      ssl: "require",
      prepare: false,
    });
    client = drizzle(sql, { schema });
  }
  return client;
}
