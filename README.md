# Spectatr Claude Plugins

Internal Claude Code tools for the Spectatr engineering team.

## Installation

```bash
/plugin marketplace add Spectatr-ai/spectatr-claude-plugins
/plugin install spectatr-tools@spectatr-marketplace
```

## Skills

- `/branch-management` — Git branching conventions (feat/*, hotfix/*, dev, main)
- `/linear-conventions` — Linear hierarchy and labeling rules (Initiative → Project → Issue)
- `/learn-from-pr` — Extract standing rules from PR review feedback
- `/handoff` — Generate session handoff prompts when switching contexts

## Org-Wide Setup (Admin)

To auto-enable for all team members via managed settings:

```json
{
  "extraKnownMarketplaces": {
    "spectatr-marketplace": {
      "source": {
        "source": "github",
        "repo": "Spectatr-ai/spectatr-claude-plugins"
      }
    }
  },
  "enabledPlugins": {
    "spectatr-tools@spectatr-marketplace": true
  }
}
```
