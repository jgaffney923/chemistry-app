---
id: 0000
title: Short title
status: todo        # todo | in-progress | review | changes | approved | done | blocked
priority: 2         # 1 = high, 2 = normal, 3 = low
depends_on: []      # e.g. [0001, 0002]
agent: any          # builder tool: claude | copilot | any
model:              # builder model, e.g. claude-opus-5-5, claude-sonnet-5-5, gpt-5.5 (blank: coordinator picks)
reviewer: any       # review tool, normally the other one from agent: claude | copilot | any
review_model:       # reviewer model (blank: coordinator picks)
---

## Goal
What should be true when this is finished, in plain language.

## Context
Relevant files, links, decisions, or gotchas.

## Acceptance criteria
- [ ] ...
- [ ] App builds (or serves) and runs locally with no console errors, and existing features still work
- [ ] Follows the design rules in this repo's CLAUDE.md

## Log
<!-- Agents append entries here. Newest at the bottom. -->
