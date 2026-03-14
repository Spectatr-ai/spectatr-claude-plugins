---
name: linear-conventions
description: Use when creating, updating, or organizing work items in Linear — covers when to create Initiatives vs Projects vs Issues, labeling rules, and hierarchy conventions for SpectatrAI. Triggers on any Linear MCP tool call, issue triage, project planning, or work item creation.
---

# Linear Conventions for SpectatrAI

## Overview

All Linear work follows a strict hierarchy: **Initiative (WHY) → Project (WHAT) → Issue (HOW)**. Every work item must be created at the correct level with proper labels.

## The Hierarchy

```
Initiative (WHY — company goal)
  → Project (WHAT — a deliverable)
      → Issue (HOW — a single task)
```

## Definitions

| Concept | What it is | Example |
|---------|-----------|---------|
| **Initiative** | Company-level goal/objective. Groups multiple projects. | "Scale B2B Platform for Enterprise Clients" |
| **Project** | Concrete deliverable with outcome and target date. Contains issues. | "Axis B2B - Face Recognition Module" |
| **Issue** | Single task — bug, feature, improvement, or tech debt. | "Add batch upload endpoint for face embeddings" |
| **Project Label** | Tag on projects to filter by product. | Axis B2B, Pulse, Jordy |
| **Issue Label (Product)** | Tag on issues identifying which product. | Axis B2B, Pulse, Jordy |
| **Issue Label (Type)** | Tag on issues classifying kind of work. | Bug, Feature, Tech Debt, DevOps |

## When to Create What

**Decision rules:**

| Scenario | Action |
|----------|--------|
| Company-wide goal spanning multiple projects | Create an **Initiative** |
| New feature / major deliverable | Create a **Project** (under an Initiative if one exists) |
| Task within an existing project | Create an **Issue** inside that Project |
| Standalone bug or small fix (no project context) | Create a standalone **Issue** with Product + Type labels |
| Maintenance on product with no active project | Create a standalone **Issue** with Product + Type labels |
| Product deployed, no work happening | **Nothing** — labels exist for when work comes up |

## Labeling Rules

**Every issue MUST have both:**

1. **Product label** — which product it belongs to
2. **Type label** — what kind of work it is

**Every project MUST have:**

1. **Project label** — which product it delivers for

**Initiatives** do not carry labels — they are organizational containers only.

### Escalation

If a standalone issue grows into multiple tasks, promote it to a Project. Create the Project, move the original issue inside it, and add new issues as needed.

### Available Labels

**Product labels (Issues & Projects):**
- Pulse — Sports live stream to AI highlights, live clipping, aspect ratio, metadata
- Axis B2B — Media access management B2B, face recognition, video search, organize & sort
- Axis B2C — Axis open for all, pay as you go
- Jordy — Sports chatbot assistant, deployable on websites/apps with hyperpersonalization
- Web-Fantasy — Web-fantasy as a service, providing fantasy tech to clients
- Spectatr.ai Website — Main website landing for sales reach and online presence
- Platform / Infra — Shared infrastructure, platform services, cross-cutting concerns

**Type labels (Issues only):**
- Bug — Something broken
- Feature — New functionality
- Improvement — Enhancement to existing functionality
- Tech Debt — Code quality, refactors, migrations, performance improvements
- DevOps — CI/CD, cloud infrastructure, monitoring, deployments

### Team

All issues go to the **Product Engineers** team unless specified otherwise.

## Real Example

```
Initiative: "Launch Pulse 2.0"              ← company goal

├── Project: "Pulse - Live Clipping"        ← deliverable (project label: Pulse)
│   ├── Issue: "Support 9:16 aspect ratio"           (labels: Pulse + Feature)
│   ├── Issue: "Add clip metadata export"            (labels: Pulse + Feature)
│   └── Issue: "Fix stream disconnect bug"           (labels: Pulse + Bug)
│
└── Project: "Pulse - AI Highlights"        ← deliverable (project label: Pulse)
    ├── Issue: "Train highlight model v3"            (labels: Pulse + Feature)
    └── Issue: "Build highlights review UI"          (labels: Pulse + Feature)

Standalone (no project):
└── Issue: "Web-Fantasy - Fix login timeout"         (labels: Web-Fantasy + Bug)
```

## Common Mistakes

- **Creating a Project for a single bug** — use a standalone Issue with labels instead
- **Forgetting Type labels** — every issue needs Bug/Feature/Improvement/Tech Debt/DevOps
- **Forgetting Product labels** — every issue needs a product tag for filtering
- **Creating an Initiative when there's no active objective** — only create if there's real work spanning multiple projects
- **Putting standalone issues in a random project** — if there's no project context, just use labels
- **Skipping project labels on Projects** — always tag the product a project delivers for
