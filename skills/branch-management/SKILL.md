---
name: branch-management
description: Use when creating branches, starting feature work, making hotfixes, or any git branching decision. Enforces Spectatr branch naming conventions, hierarchy, and merge rules. Triggers on branch creation, "new feature", "hotfix", "start working on", or any git workflow decision.
---

# Spectatr Branch Management SOP

## Branch Types

| Branch Type | Pattern    | Environment | Purpose                             |
|-------------|------------|-------------|-------------------------------------|
| Main        | `main`     | Production  | Stable, production-ready code       |
| Hotfix      | `hotfix/*` | Production  | Emergency production fixes only     |
| Dev         | `dev`      | Development | Integration branch for all features |
| Feature     | `feat/*`   | Development | Individual feature development      |

## Branch Hierarchy

```
feat/*  ──►  dev  ──►  main
              ▲          ▲
              └──────────┤
                         │
                      hotfix/*
```

- `feat/*` branches are upstream of `dev`
- `dev` is upstream of `main`
- `hotfix/*` branches are upstream of `main` and must also be merged into `dev` immediately after
- `main` and `dev` are **protected** — no direct pushes, all changes via reviewed PR

## Branch Creation Rules

### Feature Branch
1. **Always branch off `dev`**
2. Name: `feat/<descriptive-name>` (e.g. `feat/user-authentication`, `feat/payment-redesign`)
3. Names should clearly reflect the scope of work — no ticket reference required
4. **Only fully complete features may be merged into `dev`** — no incomplete or half-finished work

```bash
git checkout dev
git pull origin dev
git checkout -b feat/<feature-name>
```

### Hotfix Branch
1. **Reserved strictly for emergency production fixes only** — not for features or non-critical changes
2. **Always branch off `main`**
3. Name: `hotfix/<issue-name>` (e.g. `hotfix/login-crash`, `hotfix/payment-timeout`)

```bash
git checkout main
git pull origin main
git checkout -b hotfix/<issue-name>
```

## Merge Rules

| Scenario | Merge Target | Then Also |
|----------|-------------|-----------|
| Feature complete | `feat/*` → `dev` via PR | — |
| Hotfix complete | `hotfix/*` → `main` via PR | Immediately merge into `dev` |
| Release to production | `dev` → `main` via PR | — |

## PR Requirements

- All merges into `dev` and `main` must go through a Pull Request
- PRs must be reviewed and approved before merging
- PR descriptions should clearly state purpose and context
- **Merge conflicts:** Author must rebase against latest upstream and resolve before requesting review

## Quick Reference

| Scenario                      | Action                                                                 |
|-------------------------------|------------------------------------------------------------------------|
| Starting new feature work     | Branch off `dev` → `feat/your-feature-name`                           |
| Finished a feature            | PR from `feat/*` → `dev`, review, merge, delete branch                |
| Emergency production fix      | Branch off `main` → `hotfix/issue-name`, PR to `main`, then to `dev`  |
| Releasing to production       | PR from `dev` → `main`, review, merge                                 |
| Merge conflicts on PR         | Rebase against latest upstream, resolve conflicts, push                |

## Validation Checklist

Before creating a branch, verify:
- [ ] Correct base branch (`dev` for features, `main` for hotfixes)
- [ ] Correct prefix (`feat/` or `hotfix/`)
- [ ] Descriptive name that reflects the scope
- [ ] For hotfixes: this is genuinely an emergency production fix
