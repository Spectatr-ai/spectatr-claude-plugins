---
tags: [product-alerts]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

This is the checkout handler from spectatr-web (Next.js, runs server-side, APP_ENV is prod/dev/local). We keep finding out from customers that payments failed. Add alerting so the team hears about payment failures in Slack, and wire it properly for the repo. Don't spam us for normal stuff.

Input files: checkout.ts
