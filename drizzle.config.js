// drizzle-kit config (spec section 9: `npx drizzle-kit push`).
export default {
  schema: "./lib/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
