import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { backup, openDatabase } from "../../src/database.mjs";

test("built-in SQLite persistence and backup work without a native addon", async (context) => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "livo-sqlite-"));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const sourcePath = path.join(directory, "source.sqlite");
  const backupPath = path.join(directory, "backup.sqlite");
  const source = openDatabase(sourcePath);
  source.exec("CREATE TABLE sample(value TEXT NOT NULL) STRICT");
  source.prepare("INSERT INTO sample(value) VALUES(?)").run("durable");
  await backup(source, backupPath);
  source.close();
  const restored = openDatabase(backupPath);
  try {
    assert.equal(restored.prepare("SELECT value FROM sample").get().value, "durable");
  } finally {
    restored.close();
  }
});
