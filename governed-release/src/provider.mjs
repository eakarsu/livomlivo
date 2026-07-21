import { createHmac } from "node:crypto";
import { z } from "zod";

const responseSchema = z.object({ receiptId: z.string().min(1).max(200) }).strict();

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function deployWithRetry(config, payload, idempotencyKey, fetchImplementation = fetch) {
  const body = JSON.stringify(payload);
  const signature = createHmac("sha256", config.deploymentWebhookSecret).update(body).digest("hex");
  const attempts = [];
  for (let attempt = 1; attempt <= config.deploymentMaxAttempts; attempt += 1) {
    try {
      const response = await fetchImplementation(config.deploymentWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
          "X-Livo-Signature-SHA256": signature,
        },
        body,
        signal: AbortSignal.timeout(config.deploymentTimeoutMs),
      });
      if (!response.ok) {
        attempts.push({ attempt, outcome: "FAILED", errorCode: "PROVIDER_HTTP_ERROR", providerStatus: response.status });
      } else {
        const result = responseSchema.safeParse(await response.json());
        if (result.success) {
          attempts.push({ attempt, outcome: "SUCCEEDED", errorCode: null, providerStatus: response.status });
          return { ok: true, receiptId: result.data.receiptId, attempts };
        }
        attempts.push({ attempt, outcome: "FAILED", errorCode: "INVALID_PROVIDER_RESPONSE", providerStatus: response.status });
      }
    } catch (error) {
      attempts.push({ attempt, outcome: "FAILED", errorCode: error?.name === "TimeoutError" ? "PROVIDER_TIMEOUT" : "PROVIDER_UNAVAILABLE", providerStatus: null });
    }
    if (attempt < config.deploymentMaxAttempts) await wait(Math.min(25 * 2 ** (attempt - 1), 200));
  }
  return { ok: false, attempts };
}
