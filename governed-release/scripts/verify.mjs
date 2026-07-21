import { verifyAudit } from "../src/audit.mjs";
import { loadConfig } from "../src/config.mjs";
import { openDatabase } from "../src/database.mjs";
import { verifyMigrations } from "../src/migrations.mjs";

export function verifyDatabase(database) {
  const migrations = verifyMigrations(database);
  if (!migrations.ok) throw new Error(migrations.reason);
  const integrity = database.prepare("PRAGMA integrity_check").get().integrity_check;
  if (integrity !== "ok") throw new Error(`SQLite integrity check failed: ${integrity}`);
  const foreignKeys = database.prepare("PRAGMA foreign_key_check").all();
  if (foreignKeys.length > 0) throw new Error(`Foreign-key violations: ${foreignKeys.length}`);
  for (const trigger of ["audit_events_no_update", "audit_events_no_delete"]) {
    if (!database.prepare("SELECT name FROM sqlite_master WHERE type = 'trigger' AND name = ?").get(trigger)) {
      throw new Error(`Missing database control: ${trigger}`);
    }
  }
  const organizations = database.prepare("SELECT id, slug FROM organizations ORDER BY slug").all();
  for (const organization of organizations) {
    const audit = verifyAudit(database, organization.id);
    if (!audit.ok) throw new Error(`Audit chain failed for ${organization.slug} at ${audit.failedEventId}`);
  }
  return { migrations: migrations.count, organizations: organizations.length, auditChains: "valid", integrity };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const database = openDatabase(config.databasePath);
  try {
    console.info(JSON.stringify(verifyDatabase(database)));
  } finally {
    database.close();
  }
}
