---
tags: [product-alerts]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

Set up alerting for livemux-control (this FastAPI service, main.py attached). We want to know in slack when something actually breaks for a client, including crashes we didn't anticipate. ENV is prod or dev.

Input files: main.py
