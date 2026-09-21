import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { relations } from "./db/schema";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Define it in .env.local");
}

const databaseUrl = new URL(process.env.DATABASE_URL);
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
