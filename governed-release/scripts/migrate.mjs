import { loadConfig } from "../src/config.mjs";
import { openDatabase } from "../src/database.mjs";
import { migrate, verifyMigrations } from "../src/migrations.mjs";

const config = loadConfig();
const database = openDatabase(config.databasePath);
try {
  migrate(database);
  const result = verifyMigrations(database);
  if (!result.ok) throw new Error(result.reason);
  console.info(`Migrations verified (${result.count})`);
} finally {
  database.close();
}
