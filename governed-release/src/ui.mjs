import http from "node:http";
const port = Number(process.env.FRONTEND_PORT);
if (!Number.isInteger(port)) throw new Error("FRONTEND_PORT is required");
const page = `<!doctype html><html><head><meta charset="utf-8"><title>Livomlivo Release Governance</title></head><body><main><h1>Release Governance</h1><p>Authenticate through the governed runtime API to review release operations.</p></main></body></html>`;
const server = http.createServer((_request, response) => { response.writeHead(200, { "content-type": "text/html; charset=utf-8" }); response.end(page); });
server.listen(port, "127.0.0.1", () => console.info(`Livomlivo UI listening on http://127.0.0.1:${port}`));
const shutdown = () => server.close(() => process.exit(0));
process.once("SIGINT", shutdown); process.once("SIGTERM", shutdown);
