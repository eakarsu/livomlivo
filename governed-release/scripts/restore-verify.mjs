import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { backup, openDatabase } from "../src/database.mjs";
import { verifyDatabase } from "./verify.mjs";

if (process.argv.length !== 4) throw new Error("Usage: node scripts/restore-verify.mjs BACKUP.sqlite EMPTY_RESTORE.sqlite");
const sourcePath = path.resolve(process.argv[2]);
const restorePath = path.resolve(process.argv[3]);
if (!existsSync(sourcePath)) throw new Error(`Backup does not exist: ${sourcePath}`);
if (existsSync(restorePath)) throw new Error(`Refusing to overwrite restore target: ${restorePath}`);
mkdirSync(path.dirname(restorePath), { recursive: true, mode: 0o700 });

const source = openDatabase(sourcePath);
try {
  verifyDatabase(source);
  await backup(source, restorePath);
} finally {
  source.close();
}
const restored = openDatabase(restorePath);
try {
  console.info(JSON.stringify({ restored: restorePath, ...verifyDatabase(restored) }));
} finally {
  restored.close();
}
