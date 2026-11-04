# Alert API

`POST https://alerts.spectatr.ai/v1/alert`, JSON body. Token in `Authorization: Bearer`, `X-Alert-Token`, or a `token` field in the body (for `navigator.sendBeacon`, which cannot set headers). Content-Type is not checked. Unknown fields are rejected.

| field | required | limit | notes |
|---|---|---|---|
| `product` | yes | 64 | repo name, lowercase, e.g. `spectatr-web` |
| `title` | yes | 140 | stable, no IDs; shown as `[env] title` |
| `env` | no | 32 | `prod`, `dev`, `staging`; default `unknown` |
| `severity` | no | | `critical`, `error` (default), `warning` |
| `message` | no | 3000 | Slack mrkdwn allowed |
| `context` | no | 20 keys | scalar values; first 6 render as a grid |
| `stack` | no | 2500 | first 5 lines shown |
| `url` | no | 1000 | http(s), makes the title a link |
| `fingerprint` | no | 128 | dedup key override |

Responses:

| status | body |
|---|---|
| 202 | `{"deduped":false,"count":1,"id":"..."}` posted |
| 202 | `{"deduped":true,"count":N,"id":"..."}` folded into a message from the last 5 minutes |
| 400 | `{"error":"..."}` what was wrong with the body |
| 401 | bad or missing token |
| 413 | body over 16 KB |
| 429 | rate limited, `Retry-After: 60` |
| 502 | Slack rejected the message |

Server: `spectatr-infra/cloudflare/alerts`. Tokens are the `ALERT_TOKENS` secret on that Worker.
