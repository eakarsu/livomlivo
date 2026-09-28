import http from "node:http";

const port = Number(process.env.FRONTEND_PORT);
const apiPort = Number(process.env.PORT);
if (!Number.isInteger(port) || !Number.isInteger(apiPort)) throw new Error("FRONTEND_PORT and PORT are required");

const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Livomlivo Release Governance</title><style>body{font:16px system-ui;background:#0b1220;color:#e5edf8;margin:0;min-height:100vh;display:grid;place-items:center}main{width:min(420px,calc(100% - 40px));background:#132035;padding:32px;border-radius:18px}form{display:grid;gap:14px}label{display:grid;gap:6px}input,button{font:inherit;padding:12px;border-radius:9px;border:1px solid #52637d}button{cursor:pointer}.primary{background:#2f6fed;color:white}.secondary{background:transparent;color:#dbeafe}#dashboard[hidden],#login[hidden]{display:none}.error{color:#fecaca}</style></head><body><main><section id="login"><h1>Release Governance</h1><p>Sign in to review governed release operations.</p><form id="login-form"><label>Email<input id="email" type="email" autocomplete="username" required></label><label>Password<input id="password" type="password" autocomplete="current-password" required></label><p id="error" class="error" role="alert"></p><button id="fill" class="secondary" type="button">Auto Fill Demo Credentials</button><button class="primary" type="submit">Sign In</button></form></section><section id="dashboard" hidden><h1>Authenticated Release Dashboard</h1><p id="identity"></p><p>Your governed release operations are ready for review.</p></section></main><script>const login=document.querySelector('#login');const dashboard=document.querySelector('#dashboard');const email=document.querySelector('#email');const password=document.querySelector('#password');const error=document.querySelector('#error');document.querySelector('#fill').addEventListener('click',async()=>{error.textContent='';const response=await fetch('/api/auth/demo-credentials');if(!response.ok){error.textContent='Demo credentials are unavailable.';return}const value=await response.json();email.value=value.email;password.value=value.password});document.querySelector('#login-form').addEventListener('submit',async event=>{event.preventDefault();error.textContent='';const response=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:email.value,password:password.value})});if(!response.ok){error.textContent='Sign in failed.';return}const value=await response.json();sessionStorage.setItem('livomlivo_access_token',value.token);document.querySelector('#identity').textContent='Signed in as '+(value.user?.email||email.value);login.hidden=true;dashboard.hidden=false});</script></body></html>`;

const server = http.createServer((request, response) => {
  if (request.url?.startsWith("/api/")) {
    const upstream = http.request({
      hostname: "127.0.0.1",
      port: apiPort,
      method: request.method,
      path: request.url,
      headers: { ...request.headers, host: `127.0.0.1:${apiPort}` },
    }, (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    });
    upstream.on("error", () => { response.writeHead(502); response.end("API unavailable"); });
    request.pipe(upstream);
    return;
  }
  response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
  response.end(page);
});
server.listen(port, "127.0.0.1", () => console.info(`Livomlivo UI listening on http://127.0.0.1:${port}`));
const shutdown = () => server.close(() => process.exit(0));
process.once("SIGINT", shutdown); process.once("SIGTERM", shutdown);
