# Deployment-provider contract

`POST DEPLOYMENT_WEBHOOK_URL` receives JSON containing `releaseId`, `applicationKey`, `versionLabel`, `artifactUri`, `artifactSha256`, and `environment`. The service sends the workflow idempotency key and `X-Livo-Signature-SHA256`, which is lowercase HMAC-SHA256 of the exact request bytes using `DEPLOYMENT_WEBHOOK_SECRET`.

The provider must verify TLS, signature, timestamp at its boundary, artifact digest, authorization for the named environment, and idempotency before changing deployment state. A successful 2xx response must be strict JSON:

```json
{"receiptId":"provider-controlled-non-secret-reference"}
```

Non-2xx, timeout, connection, invalid JSON, and invalid receipt responses are failures. The service makes at most `DEPLOYMENT_MAX_ATTEMPTS` calls with short exponential backoff and sends the same idempotency key on every attempt. It stores attempt outcome/code/status but never stores or logs the provider response body. Providers must return no credentials or sensitive data in the receipt.
