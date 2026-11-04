---
name: product-alerts
description: Wire a Spectatr product into the shared alerting endpoint (alerts.spectatr.ai) so client-facing failures reach #product-alerts in Slack, and decide which failures deserve an alert at all. Use this whenever someone wants to add alerting, error reporting, Slack notifications on failures, "tell us when X breaks", Sentry-style crash capture, or asks what should and should not alert. Also use it when reviewing code that already posts alerts, to stop expected errors from reaching the channel.
user_invocable: true
---

# Product alerts

One endpoint for every product. Anything that lands in #product-alerts means a person should investigate now, so the hard part of this skill is deciding what *not* to send.

```
POST https://alerts.spectatr.ai/v1/alert
Authorization: Bearer $ALERT_TOKEN
Content-Type: application/json
```

The token is public by design (it ships in frontends) and only identifies the caller. Flood protection lives server side: 20 req/min per IP, 60 per token, dedup over 5 minutes. Ask the infra owner for the token and add it as `ALERT_TOKEN` the way the repo already manages env (dotenvx `.env` files on backends, build-time env on frontends). In a frontend bundle keep it out of plain sight, base64 in the build env or split across two constants, so it is not a grep away; that stops scrapers, not people, and the rate limits do the rest.

## What deserves an alert

The test: would someone act on this within the hour? If not, it is a log line, not an alert.

Alert when a client-facing feature failed in a way the client cannot fix: a payment did not go through, a stream is not being recorded, an upload was lost, an export never finished, our own API returned 5xx, a job failed after its retries, a third party we depend on is down, data is inconsistent. Unhandled exceptions in production belong here too, through one global handler.

Do not alert on expected failures: validation errors, 400/401/403/404, a user cancelling, a client being rate limited, a retry that then succeeded, anything in `local` or `test`, or anything Alertmanager already covers (nodes, pods, disks, the cluster). From a browser, a request that got no response at all (offline, timeout, CORS) is the user's network, not our failure, so it does not alert either; only a 5xx from our own API does. Do not alert from inside every `catch`; pick the few places where a failure means a client lost something.

Loops that retry forever (an uploader, a poller waiting for a source) alert once after a run of consecutive failures long enough to mean something is really wrong, around 30 seconds, and reset the count on success. On a hot path such as a polled read, alert where the dependency failure is detected rather than per request: the server folds repeats by title, but every call still counts against the 20 per minute per IP limit.

Severity:

| severity | meaning | effect |
|---|---|---|
| `critical` | clients are affected right now, revenue or live content at stake | pings @channel |
| `error` | a feature failed for a client, investigate today | posts |
| `warning` | degrading, will become an error if ignored | posts |

There is no `info`. Deploys go to #pulse-deployments, metrics go to Grafana.

## Shape of a good alert

- `title` is stable and specific: "Payment capture failed", not "Error" and not "Order 8213 failed". IDs go in `context`.
- `message` says what the client experienced and what we know, one or two sentences. Slack mrkdwn works, so bold the number that matters.
- `context` carries the facts someone needs to start investigating: route, user or org id, stream id, region, release. Six or fewer show as a grid.
- `stack` for exceptions. `url` links the title to the dashboard, trace or page that shows the problem.
- `fingerprint` when the title must vary: repeats inside five minutes fold into one message with a counter, keyed on product + env + severity + title unless you set one.

Full field list in [references/api.md](references/api.md).

## Wiring it into a codebase

Add one small helper per repo and call it from the few places that matter. Copy the helper for the stack from [references/clients.md](references/clients.md), then name and place it the way the repo places shared utilities (its folder layout, casing and barrel exports win over the reference's file name). The reference already does the things that are easy to get wrong:

- fire and forget: short timeout, never block or crash the caller; a rejected or failed send is logged at warn so a wrong token is noticed, never raised
- on a path that exits the process right after alerting (a worker's crash path), flush pending sends before exiting or the alert is lost
- product is the repo name, one per repo; a repo with several binaries says which one in the title or context, not in `product`
- env from the variable the service already uses (`ENV`, `APP_ENV`, `NAMESPACE`, `VITE_`-prefixed `import.meta.env` in Vite, `NEXT_PUBLIC_` in Next client code); when it is unset, stay silent rather than post as `unknown`
- silent when env is `local` or `test`
- `context` values are scalars; nested objects are rejected by the server
- in browser code the function is not called `alert`, which shadows `window.alert`
- the global handlers for that stack (window error events, unhandled rejections, process-level exceptions, framework exception handlers) with the expected-error filter applied

Then add explicit calls at the business failure points found by reading the code: the catch around the payment call, the branch where a recording job gives up, the place a webhook from a provider reports failure.

Before opening the PR, send one `warning` from a dev environment with the title "Alerting wired for <product>" and confirm it appears in #product-alerts, then delete it or say in the PR that it is there.

## When reviewing existing alert calls

Look for: alerts inside request validation, alerts on 4xx, alerts before a retry loop finishes, titles that embed IDs or timestamps (they defeat dedup), `critical` used for anything short of clients being affected now, and alerts from non-production environments. Each of these turns the channel into noise, and a noisy channel gets muted.
