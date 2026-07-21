import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { transaction } from "./database.mjs";

const migrationsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../migrations");

function migrations() {
  return readdirSync(migrationsDirectory)
    .filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name))
    .sort()
    .map((id) => {
      const sql = readFileSync(path.join(migrationsDirectory, id), "utf8");
      return { id, sql, checksum: createHash("sha256").update(sql).digest("hex") };
    });
}

function ensureMigrationTable(database) {
  database.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    checksum TEXT NOT NULL CHECK (length(checksum) = 64),
    applied_at TEXT NOT NULL
  ) STRICT`);
}

export function migrate(database, now = new Date()) {
  ensureMigrationTable(database);
  const existing = new Map(database.prepare("SELECT id, checksum FROM schema_migrations").all().map((row) => [row.id, row.checksum]));
  for (const migration of migrations()) {
    if (existing.has(migration.id) && existing.get(migration.id) !== migration.checksum) {
      throw new Error(`Migration checksum mismatch: ${migration.id}`);
    }
    if (existing.has(migration.id)) continue;
    transaction(database, () => {
      database.exec(migration.sql);
      database.prepare("INSERT INTO schema_migrations (id, checksum, applied_at) VALUES (?, ?, ?)")
        .run(migration.id, migration.checksum, now.toISOString());
    });
  }
}

export function verifyMigrations(database) {
  const expected = migrations();
  const table = database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'schema_migrations'").get();
  if (!table) return { ok: false, reason: "schema_migrations is missing" };
  const actual = database.prepare("SELECT id, checksum FROM schema_migrations ORDER BY id").all();
  if (actual.length !== expected.length) return { ok: false, reason: `expected ${expected.length} migrations; found ${actual.length}` };
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index].id !== expected[index].id || actual[index].checksum !== expected[index].checksum) {
      return { ok: false, reason: `unexpected or modified migration ${actual[index].id}` };
    }
  }
  return { ok: true, count: expected.length };
}
