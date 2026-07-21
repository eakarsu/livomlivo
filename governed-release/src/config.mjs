import path from "node:path";
import { z } from "zod";

const booleanValue = z.enum(["true", "false"]).transform((value) => value === "true");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3020),
  DATABASE_PATH: z.string().min(1),
  MIGRATE_ON_START: booleanValue.default("false"),
  ALLOWED_ORIGINS: z.string().default(""),
  IDEMPOTENCY_SECRET: z.string().min(32),
  DEPLOYMENT_WEBHOOK_URL: z.string().url(),
  DEPLOYMENT_WEBHOOK_SECRET: z.string().min(32),
  DEPLOYMENT_TIMEOUT_MS: z.coerce.number().int().min(100).max(30_000).default(3000),
  DEPLOYMENT_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(5).default(3),
});

export function loadConfig(environment = process.env) {
  const result = schema.safeParse(environment);
  if (!result.success) {
    throw new Error(`Invalid configuration: ${result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
  }
  const value = result.data;
  if (value.DATABASE_PATH !== ":memory:" && !path.isAbsolute(value.DATABASE_PATH)) {
    throw new Error("DATABASE_PATH must be absolute or :memory:");
  }
  const webhookUrl = new URL(value.DEPLOYMENT_WEBHOOK_URL);
  if (value.NODE_ENV === "production" && webhookUrl.protocol !== "https:") {
    throw new Error("DEPLOYMENT_WEBHOOK_URL must use HTTPS in production");
  }
  if (!["http:", "https:"].includes(webhookUrl.protocol)) {
    throw new Error("DEPLOYMENT_WEBHOOK_URL must use HTTP or HTTPS");
  }
  const allowedOrigins = value.ALLOWED_ORIGINS.split(",").map((item) => item.trim()).filter(Boolean);
  for (const origin of allowedOrigins) {
    if (new URL(origin).origin !== origin) throw new Error(`Invalid ALLOWED_ORIGINS value: ${origin}`);
  }
  return {
    nodeEnv: value.NODE_ENV,
    port: value.PORT,
    databasePath: value.DATABASE_PATH,
    migrateOnStart: value.MIGRATE_ON_START,
    allowedOrigins,
    idempotencySecret: value.IDEMPOTENCY_SECRET,
    deploymentWebhookUrl: webhookUrl.toString(),
    deploymentWebhookSecret: value.DEPLOYMENT_WEBHOOK_SECRET,
    deploymentTimeoutMs: value.DEPLOYMENT_TIMEOUT_MS,
    deploymentMaxAttempts: value.DEPLOYMENT_MAX_ATTEMPTS,
  };
}
