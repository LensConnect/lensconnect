import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Define it in .env.local or .env.");
}

const connectionUrl = new URL(databaseUrl);
const database = decodeURIComponent(connectionUrl.pathname.replace(/^\/+/, ""));

if (!connectionUrl.hostname || !database) {
  throw new Error("DATABASE_URL must include a MySQL host and database name.");
}

const sslMode = connectionUrl.searchParams.get("ssl-mode")?.toUpperCase();

export default defineConfig({
  dialect: "mysql",
  schema: "./app/src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: connectionUrl.hostname,
    port: connectionUrl.port ? Number(connectionUrl.port) : 3306,
    user: decodeURIComponent(connectionUrl.username),
    password: decodeURIComponent(connectionUrl.password),
    database,
    ...(sslMode === "REQUIRED"
      ? { ssl: { rejectUnauthorized: true } }
      : {}),
  },
});
