# Client helpers

One helper per repo, placed and named the way the repo keeps shared utilities. Adjust the product name and the env variables to what the repo already uses. Every helper: times out fast, never throws, does nothing outside real environments.

## TypeScript / JavaScript (Node, Next.js)

```ts
const ENDPOINT = 'https://alerts.spectatr.ai/v1/alert';
const PRODUCT = 'spectatr-web';
const ENV = process.env.APP_ENV ?? process.env.NODE_ENV ?? 'unknown';
const TOKEN = process.env.ALERT_TOKEN;

type Alert = {
  title: string;
  severity?: 'critical' | 'error' | 'warning';
  message?: string;
  context?: Record<string, string | number | boolean | null>;
  stack?: string;
  url?: string;
  fingerprint?: string;
};

export function sendAlert(a: Alert) {
  if (!TOKEN || ENV === 'local' || ENV === 'test') return;
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ product: PRODUCT, env: ENV, ...a }),
    signal: AbortSignal.timeout(3000),
    keepalive: true,
  }).catch(() => {});
}
```

Global handlers, Node:

```ts
process.on('uncaughtException', (err) => sendAlert({ severity: 'critical', title: `Uncaught: ${err.message}`, stack: err.stack }));
process.on('unhandledRejection', (err: any) => sendAlert({ title: `Unhandled rejection: ${err?.message ?? err}`, stack: err?.stack }));
```

Express / Fastify error middleware and Next `instrumentation.ts` `onRequestError`: alert only when `status >= 500`.

## Browser (Vite, Next client)

Same helper with the browser's env: `import.meta.env.VITE_ALERT_TOKEN` and `import.meta.env.MODE` in Vite, `process.env.NEXT_PUBLIC_ALERT_TOKEN` in Next client code. `keepalive: true` lets the request outlive a page unload, so no `sendBeacon` branch is needed. Do not name the function `alert`.

```ts
const TOKEN = import.meta.env.VITE_ALERT_TOKEN;
const ENV = import.meta.env.MODE;

export function sendAlert(a: Alert) {
  if (!TOKEN || import.meta.env.DEV) return;
  fetch(ENDPOINT, { /* as above */ body: JSON.stringify({ product: PRODUCT, env: ENV, url: location.href, ...a }) }).catch(() => {});
}

export function alertApiFailure(title: string, e: unknown, context?: Alert['context']) {
  const status = e instanceof ApiError ? e.status : undefined;
  if (status === undefined || status < 500) return;
  sendAlert({ title, message: (e as Error).message, stack: (e as Error).stack, context: { ...context, status } });
}
```

Global handlers, once at app start:

```ts
window.addEventListener('error', (e) => sendAlert({ title: `Unhandled: ${e.message}`, stack: e.error?.stack }));
window.addEventListener('unhandledrejection', (e) => sendAlert({
  title: `Unhandled rejection: ${String(e.reason?.message ?? e.reason)}`, stack: e.reason?.stack,
}));
```

## Python (FastAPI, workers, Modal)

```python
import os, threading, requests

ENDPOINT = "https://alerts.spectatr.ai/v1/alert"
PRODUCT = "livemux-control"
ENV = os.getenv("APP_ENV", os.getenv("ENV", "unknown"))
TOKEN = os.getenv("ALERT_TOKEN")

def alert(title, severity="error", message=None, context=None, stack=None, url=None, fingerprint=None):
    if not TOKEN or ENV in ("local", "test"):
        return
    body = {k: v for k, v in dict(product=PRODUCT, env=ENV, severity=severity, title=title, message=message,
                                 context=context, stack=stack, url=url, fingerprint=fingerprint).items() if v is not None}
    def send():
        try:
            requests.post(ENDPOINT, json=body, headers={"Authorization": f"Bearer {TOKEN}"}, timeout=3)
        except Exception:
            pass
    threading.Thread(target=send, daemon=True).start()
```

FastAPI, one handler for unexpected exceptions only (HTTPException and validation errors never reach it):

```python
import traceback
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    alert(f"Unhandled {type(exc).__name__} on {request.url.path}", message=str(exc),
          stack=traceback.format_exc(), context={"method": request.method, "path": request.url.path})
    return JSONResponse({"error": "internal error"}, status_code=500)
```

## Go

```go
package alert

import (
	"bytes"
	"encoding/json"
	"log/slog"
	"net/http"
	"sync"
	"time"
)

const (
	endpoint = "https://alerts.spectatr.ai/v1/alert"
	product  = "livemux"
)

var (
	env, token string
	client     = &http.Client{Timeout: 3 * time.Second}
	pending    sync.WaitGroup
)

type Alert struct {
	Severity    string         `json:"severity,omitempty"`
	Title       string         `json:"title"`
	Message     string         `json:"message,omitempty"`
	Context     map[string]any `json:"context,omitempty"`
	Stack       string         `json:"stack,omitempty"`
	URL         string         `json:"url,omitempty"`
	Fingerprint string         `json:"fingerprint,omitempty"`
}

func Init(environment, alertToken string) {
	env, token = environment, alertToken
}

func Send(a Alert) {
	if token == "" || env == "" || env == "local" || env == "test" {
		return
	}
	body, _ := json.Marshal(struct {
		Product string `json:"product"`
		Env     string `json:"env"`
		Alert
	}{product, env, a})
	pending.Go(func() { post(body) })
}

func Wait() {
	pending.Wait()
}

func post(body []byte) {
	req, _ := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(body))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	res, err := client.Do(req)
	if err != nil {
		slog.Warn("alert not sent", "err", err)
		return
	}
	res.Body.Close()
	if res.StatusCode/100 != 2 {
		slog.Warn("alert rejected", "status", res.StatusCode)
	}
}
```

`Init` from `main` with the config package's values (`env.Get("ALERT_TOKEN", "")` beside the other variables). Call `Send` from the recover middleware for panics and from the business failure points, never from handlers that return 4xx. On a path that calls `os.Exit` right after `Send`, call `Wait` first.

## curl, for a one-off check

```sh
curl -X POST https://alerts.spectatr.ai/v1/alert \
  -H "Authorization: Bearer $ALERT_TOKEN" -H 'Content-Type: application/json' \
  -d '{"product":"spectatr-web","env":"dev","severity":"warning","title":"Alerting wired for spectatr-web"}'
```
