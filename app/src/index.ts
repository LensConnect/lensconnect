import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { relations } from "./db/schema";
import dotenv from "dotenv";

const isDevelopment = process.env.NODE_ENV === "development";
dotenv.config({
  path: isDevelopment ? [".env.local", ".env"] : ".env",
  override: !isDevelopment,
});

const databaseUrlValue = process.env.DATABASE_URL?.trim();

if (!databaseUrlValue) {
  throw new Error(
    isDevelopment
      ? "DATABASE_URL is not set. Define it in .env.local for local development."
      : "DATABASE_URL is not set. Define it in the production .env file or hosting environment.",
  );
}

let databaseUrl: URL;
try {
  databaseUrl = new URL(databaseUrlValue);
} catch {
  throw new Error(
    `DATABASE_URL from ${
      isDevelopment ? ".env.local" : "the production environment"
    } is invalid. Use a mysql:// URL and percent-encode special characters in the username or password.`,
  );
}

if (databaseUrl.protocol !== "mysql:") {
  throw new Error(
    `DATABASE_URL must use the mysql:// protocol; received ${databaseUrl.protocol}`,
  );
}

if (!databaseUrl.hostname || databaseUrl.pathname.length <= 1) {
  throw new Error("DATABASE_URL must include a MySQL host and database name.");
}

const sslMode = databaseUrl.searchParams.get("ssl-mode")?.toUpperCase();
databaseUrl.searchParams.delete("ssl-mode");

const connection = mysql.createPool({
  uri: databaseUrl.toString(),
  ...(sslMode === "REQUIRED" ? { ssl: { rejectUnauthorized: true } } : {}),
});

export const db = drizzle({
  client: connection.pool,
  relations,
});
