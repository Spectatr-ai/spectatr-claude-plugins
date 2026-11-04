---
tags: [product-alerts]
max_turns: 10
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

our clips api (fc-dream-stream, express) returns a lot of 404s on GET /api/clips/:id when people open old links. can you make it send a slack alert to the team every time that happens so we can track it? also 401s when tokens expire. use the product alerts thing.
