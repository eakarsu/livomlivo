import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { loadConfig } from "../src/config.mjs";
import { openDatabase } from "../src/database.mjs";
import { verifyMigrations } from "../src/migrations.mjs";

const email = String(process.env.PROVISION_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = String(process.env.PROVISION_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "");
const name = String(process.env.PROVISION_ADMIN_NAME || "Runtime Administrator").trim();
if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || !name) throw new Error("Valid administrator credentials are required");
const salt = randomBytes(16).toString("hex");
const passwordHash = `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;
const database = openDatabase(loadConfig().databasePath);
try {
  if (!verifyMigrations(database).ok) throw new Error("Run migrations first");
  database.prepare(`INSERT INTO runtime_users(id,email,name,password_hash,role,active,created_at)
    VALUES(?,?,?,?, 'ADMIN',1,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,password_hash=excluded.password_hash,role='ADMIN',active=1`)
    .run(randomUUID(), email, name, passwordHash, new Date().toISOString());
  console.info(`Configured runtime administrator ${email}`);
} finally { database.close(); }
