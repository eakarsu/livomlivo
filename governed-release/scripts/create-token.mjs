import { randomUUID } from "node:crypto";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { loadConfig } from "../src/config.mjs";
import { openDatabase, transaction } from "../src/database.mjs";
import { verifyMigrations } from "../src/migrations.mjs";
import { generateApiToken, tokenDigest } from "../src/security.mjs";

const inputSchema = z.object({
  TOKEN_ORGANIZATION_SLUG: z.string().regex(/^[a-z0-9][a-z0-9-]{1,62}$/),
  TOKEN_ORGANIZATION_NAME: z.string().trim().min(2).max(160),
  TOKEN_LABEL: z.string().trim().min(2).max(120),
  TOKEN_ROLE: z.enum(["DEVELOPER", "REVIEWER", "OPERATOR", "AUDITOR"]),
  TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  TOKEN_OUTPUT_PATH: z.string().min(1),
});
const input = inputSchema.safeParse(process.env);
if (!input.success) throw new Error(`Invalid token bootstrap configuration: ${input.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
const outputPath = path.resolve(input.data.TOKEN_OUTPUT_PATH);
if (existsSync(outputPath)) throw new Error(`Refusing to overwrite token output: ${outputPath}`);

const config = loadConfig();
const database = openDatabase(config.databasePath);
try {
  const migrationState = verifyMigrations(database);
  if (!migrationState.ok) throw new Error(`Run migrations first: ${migrationState.reason}`);
  const token = generateApiToken();
  const now = new Date();
  const expires = new Date(now.getTime() + input.data.TOKEN_TTL_DAYS * 86_400_000);
  const result = transaction(database, () => {
    let organization = database.prepare("SELECT id, slug FROM organizations WHERE slug = ?").get(input.data.TOKEN_ORGANIZATION_SLUG);
    if (!organization) {
      const id = randomUUID();
      database.prepare("INSERT INTO organizations (id, slug, name, created_at) VALUES (?, ?, ?, ?)")
        .run(id, input.data.TOKEN_ORGANIZATION_SLUG, input.data.TOKEN_ORGANIZATION_NAME, now.toISOString());
      organization = { id, slug: input.data.TOKEN_ORGANIZATION_SLUG };
    }
    const tokenId = randomUUID();
    database.prepare(`INSERT INTO api_tokens
      (id, organization_id, label, role, token_digest, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(tokenId, organization.id, input.data.TOKEN_LABEL, input.data.TOKEN_ROLE,
        tokenDigest(token), expires.toISOString(), now.toISOString());
    return { tokenId, organization };
  });
  writeFileSync(outputPath, `${token}\n`, { mode: 0o600, flag: "wx" });
  console.info(`Created ${input.data.TOKEN_ROLE} token ${result.tokenId} for ${result.organization.slug}.`);
  console.info(`The one-time token was written mode 0600 to ${outputPath}; only its digest is stored.`);
} finally {
  database.close();
}
