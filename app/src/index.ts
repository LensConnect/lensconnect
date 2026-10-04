import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { relations } from "./db/schema";

const configuredDatabaseUrl = process.env.DATABASE_URL?.trim();

if (!configuredDatabaseUrl) {
  throw new Error("DATABASE_URL environment variable is not configured.");
}

let databaseUrl: URL;

try {
  databaseUrl = new URL(configuredDatabaseUrl);
} catch (error) {
  throw new Error(
    "DATABASE_URL must be a valid MySQL connection URL (mysql://user:password@host:port/database). Encode special characters in the username or password.",
    { cause: error },
  );
}

if (databaseUrl.protocol !== "mysql:") {
  throw new Error("DATABASE_URL must use the mysql:// protocol.");
}

const sslMode = databaseUrl.searchParams.get("ssl-mode")?.toUpperCase();

databaseUrl.searchParams.delete("ssl-mode");

const connection = mysql.createPool({
  uri: databaseUrl.toString(),
  ...(sslMode === "REQUIRED"
    ? {
        ssl: {
          rejectUnauthorized: true,
        },
      }
    : {}),
});

export const db = drizzle({
  client: connection.pool,
  relations,
});