---
name: learn-from-pr
description: Use when receiving PR review feedback to extract standing rules. Triggers on "learn from PR", "extract rules from review", or after a PR is reviewed.
disable-model-invocation: true
allowed-tools: Bash(gh *), Read, Edit, Write
---

# /learn-from-pr — Extract Rules from PR Reviews

Read review comments from a GitHub PR and extract lessons into the mistakes hierarchy.

**IMPORTANT:** Rules go to `docs/mistakes.md` (raw log) by default. Only promote to `.claude/rules/mistakes.md` if the pattern has occurred before or generalizes across features.

## Where rules go

```
docs/mistakes.md              ← ALL corrections land here first (raw log)
       ↓ only if:
       - 2nd+ occurrence of same pattern, OR
       - generalizes across >1 feature area
       ↓
.claude/rules/mistakes.md     ← promoted standing rules (loaded every session)
```

`.claude/rules/mistakes.md` is loaded into Claude's context every session. Keep it high-signal only. Most PR feedback is a one-off correction that belongs in the raw log.

## Steps

1. **Fetch PR review comments:**
   ```bash
   gh pr view $ARGUMENTS --comments
   gh api repos/{owner}/{repo}/pulls/$ARGUMENTS/reviews
   gh api repos/{owner}/{repo}/pulls/$ARGUMENTS/comments
   ```

2. **Identify corrections** — look for:
   - Reviewer pointing out a mistake or bad pattern
   - Suggestions to do something differently
   - Change requests that imply a general rule
   - Skip: approvals, questions, nitpicks with no generalizable lesson

3. **Ensure the file hierarchy exists.** If `docs/mistakes.md` does not exist, create it:

   ```markdown
   # Mistakes Log

   Raw log of mistakes made during development.

   ## Mistake Taxonomy

   | Type | When to use |
   |------|-------------|
   | `architectural` | Wrong structure, violated patterns, bad module boundaries |
   | `implementation` | Wrong API usage, incorrect logic, bad types, wrong library |
   | `process` | Wrong commands, skipped steps, wrong git workflow |
   | `planning` | Misread requirements, missed scope, over-engineered |

   ## Promotion Threshold

   Promote to `.claude/rules/mistakes.md` when **either**:
   - The **same pattern recurs** a 2nd time, OR
   - The mistake **generalizes across >1 feature area**

   ## Entry Format

   ### YYYY-MM-DD — [Short description]
   **Type:** architectural | implementation | process | planning
   **Source:** PR #N review by @reviewer | in-session correction
   **What went wrong:** ...
   **Why:** ...
   **New rule:** ALWAYS/NEVER ...
   **Status:** raw | [PROMOTED → .claude/rules/mistakes.md YYYY-MM-DD]

   ---

   ## Entries

   <!-- New entries go here, newest first -->
   ```

   If `.claude/rules/mistakes.md` does not exist, create it:

   ```markdown
   # Rules Promoted from Mistakes Log

   Rules extracted from `docs/mistakes.md` after a pattern recurred or generalized.

   **Source log:** docs/mistakes.md

   ## Promotion Threshold

   Promote when **either** condition is met:
   1. Same mistake pattern occurs a **2nd time**
   2. Pattern **generalizes across >1 feature area** (not isolated to one file/route)

   ---

   <!-- Promoted rules go here, newest first -->
   ```

4. **Draft entries for `docs/mistakes.md`** (one per correction):
   ```markdown
   ### YYYY-MM-DD — [Short description]
   **Type:** [architectural|implementation|process|planning]
   **Source:** PR #$ARGUMENTS review by @reviewer
   **What went wrong:** [what the reviewer flagged]
   **Why:** [root cause]
   **New rule:** ALWAYS/NEVER [actionable rule]
   **Status:** raw
   ```

5. **Show drafted entries to the user.** Ask: "Add these to docs/mistakes.md?"

6. **If confirmed**, prepend entries to `docs/mistakes.md` under `## Entries` (newest first).

7. **Check for promotion**: Search `docs/mistakes.md` for similar past entries.
   - If this is the **2nd+ occurrence** of the same pattern → promote
   - If the rule **generalizes across >1 feature area** → promote
   - Otherwise: **stop here**. The rule stays as `raw` in `docs/mistakes.md`.

8. **If promoting**: Ask the user: "This pattern has occurred before. Promote to .claude/rules/mistakes.md?"
   - If confirmed, add a standing rule to `.claude/rules/mistakes.md`:
     ```markdown
     ## [Topic]
     - ALWAYS/NEVER [rule] — promoted from docs/mistakes.md on YYYY-MM-DD
     ```
   - Update the entry in `docs/mistakes.md`: change `**Status:** raw` to `**Status:** [PROMOTED → .claude/rules/mistakes.md YYYY-MM-DD]`

9. **If no actionable corrections found**, say so. Not every review contains generalizable rules.

## Usage

```
/learn-from-pr 42
```
