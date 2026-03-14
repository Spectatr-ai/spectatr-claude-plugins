---
name: handoff
description: Use when the user is reaching context limit, wants to close the session, or needs to continue work in a new Claude Code session. Triggers on /handoff, "context limit", "running out of context", "hand off", "new session", "continue later".
user_invocable: true
---

# Session Handoff

Generate a self-contained handoff prompt that lets a new Claude Code session pick up exactly where this one left off.

## Process

### 1. Gather Context Silently

Do NOT ask the user questions. Scan the conversation history and extract:

- **Goal**: What was the user trying to accomplish this session?
- **Completed work**: What's been done? List files created/modified with brief descriptions.
- **Current state**: Where did we stop? What was the last thing being worked on?
- **Pending work**: What's left to do? Be specific — list remaining steps.
- **Key decisions**: Any architectural choices, trade-offs, or preferences the user expressed.
- **Blockers/Issues**: Any errors, bugs, or problems encountered that are unresolved.
- **Branch/Git state**: Current branch, uncommitted changes, PR status if relevant.
- **Important context**: Anything a fresh session would need to know that isn't obvious from the code alone (e.g., "user prefers X over Y", "don't touch file Z", "API key is in .env").

### 2. Check for Active Plans

Look for any `tasks/todo.md` or plan files that track progress. If they exist, incorporate their state into the handoff.

### 3. Generate the Handoff Prompt

Output a markdown code block containing the full handoff prompt. Use this structure:

````markdown
```
# Session Handoff — [Brief Title of What We're Working On]

## Goal
[1-2 sentences: what we're trying to accomplish]

## What's Been Done
- [Completed item 1 — file(s) affected]
- [Completed item 2 — file(s) affected]
- ...

## Current State
[Where we stopped. What's the immediate next action?]

## Remaining Work
- [ ] [Next step 1]
- [ ] [Next step 2]
- [ ] [Next step 3]
- ...

## Key Decisions & Context
- [Decision/preference 1]
- [Decision/preference 2]
- ...

## Known Issues
- [Issue 1 — status/workaround]
- ...

## Key Files
- `path/to/file1` — [role/purpose]
- `path/to/file2` — [role/purpose]
- ...

## Git State
- Branch: `branch-name`
- Uncommitted changes: [yes/no — brief description]
- Last commit: [message]

## Instructions
Continue from "Remaining Work" above. Start by [specific first action].
```
````

### 4. Present to User

Output the handoff prompt inside a code block so the user can copy it easily. End with:

> Copy this prompt and paste it at the start of your new Claude Code session.

## Rules

- **No questions.** Extract everything from conversation context.
- **Be specific.** File paths, function names, error messages — not vague summaries.
- **Be complete.** A fresh Claude with zero context should be able to continue.
- **Be concise.** No fluff. Every line should carry information.
- **Include the "why"** behind decisions, not just the "what".
- **Omit sections** that don't apply (e.g., no "Known Issues" if there are none).
- **Git state matters.** Always check and report it.

## Red Flags

| Thought | Reality |
|---------|---------|
| "I should ask what to include" | No. Extract from conversation. User is low on context. |
| "I'll summarize at a high level" | High-level summaries lose critical details. Be specific. |
| "Git state isn't important" | It's the first thing a new session needs to orient itself. |
| "I'll skip the remaining work" | That's the most important part — it's the TODO list for the next session. |
