import { createApp } from "./app.mjs";
import { loadConfig } from "./config.mjs";
import { openDatabase } from "./database.mjs";
import { migrate, verifyMigrations } from "./migrations.mjs";

const config = loadConfig();
const database = openDatabase(config.databasePath);
if (config.migrateOnStart) migrate(database);
const state = verifyMigrations(database);
if (!state.ok) throw new Error(`Database is not ready: ${state.reason}`);

const server = createApp({ database, config }).listen(config.port, () => {
  console.info(JSON.stringify({ event: "server_started", port: config.port }));
});

let stopping = false;
function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.info(JSON.stringify({ event: "server_stopping", signal }));
  server.close(() => {
    database.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
