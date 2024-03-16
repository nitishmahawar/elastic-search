import { Config } from "drizzle-kit";

const config = {
  driver: "pg",
  schema: "./db/schema.ts",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  out: "./drizzle",
} satisfies Config;

export default config;
