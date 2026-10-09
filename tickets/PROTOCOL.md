# Ticket protocol

Every agent (Claude Code, GitHub Copilot, or anything else) follows these rules when working a ticket in this folder. This repo's `CLAUDE.md` adds app-specific rules: how to check your work, design rules, and anything that must never happen. Follow both. If they disagree about how to write code, `CLAUDE.md` wins; if they disagree about branches, status, or logging, this file wins.

## Tickets

- One file per ticket: `tickets/NNNN-short-slug.md` (four-digit id, lowercase slug), copied from `TEMPLATE.md`.
- `status` moves: `todo` → `in-progress` → `review` → `approved` → `done`, or `blocked` along the way. If the reviewer asks for changes it goes `review` → `changes` → `in-progress` → `review` again.
- Each ticket names two roles, and the coordinator fills them in (see [COORDINATOR.md](COORDINATOR.md)):
  - **builder:** `agent` (`claude` | `copilot` | `any`) and `model`
  - **reviewer:** `reviewer` (`claude` | `copilot` | `any`) and `review_model`
  The reviewer is normally the *other* tool from the builder, so the work gets a second opinion and the token cost is split.
- **Tickets are committed to the repo and may be public.** Never put personal information in a ticket, log, or commit message: no names of family members or children, ages, photos, addresses, emails, locations, or anything else that identifies a person. Say "the owner" or "the kids".

## Picking the next ticket

When asked to "work the next ticket", first finish your own returned work: a ticket with `status: changes` and `agent` set to your tool. Otherwise choose the ticket that:

1. has `status: todo`,
2. has `agent` set to your tool (`claude` or `copilot`) or `any`,
3. has every ticket in `depends_on` at `status: done`, and
4. has no `ticket/<id>-*` branch yet (someone else is on it).

Take the lowest `priority` number first, then the lowest id. If nothing qualifies, say so and say what is blocking.

If the ticket names a `model`, use that model. If you are running as a different one, say so in your claim log line.

## Working a ticket

1. **One ticket per session.** Read the ticket, and every ticket in its `depends_on`, before starting.
2. **Branch:** work on `ticket/<id>-<slug>`, created from an up-to-date `main`. Never commit to `main`, push to `main`, or merge anything into `main`. The owner reviews and merges every ticket.
3. **Claim it:** set `status: in-progress`, add a log entry, and commit that first.
4. **Follow existing patterns** in the codebase. Read similar code before writing new code.
5. **Stay in scope.** If you find extra work, create a new ticket from `TEMPLATE.md` (next unused id, `status: todo`, log line "created by agent from ticket <id>") instead of doing it.
6. **If blocked:** set `status: blocked`, write the specific question in the log, commit, and stop. Don't guess at decisions that belong to the owner.
7. **Log as you go:** append a short log line at each meaningful step (claimed, plan, main change done, checks run), not just at the end. The dashboard reads these.
8. **When finished:** tick every acceptance criterion you met, run the checks described in `CLAUDE.md`, set `status: review`, and append a log entry covering what was done, how it was checked, and anything left over. If a criterion isn't met, say so in the log instead of ticking it.
9. **Commit messages:** `ticket <id>: <summary>`.
10. **Only the owner sets `done`**, after merging.
11. **Returned for changes:** when a ticket comes back with `status: changes`, read the reviewer's numbered list in the Log, fix each item on the same branch, log what you did for each number, and set `status: review` again.

## Reviewing a ticket

When asked to "review the next ticket", choose a ticket with `status: review` whose `reviewer` is your tool or `any`, lowest `priority` then lowest id. Use the ticket's `review_model` if it names one. Never review a ticket you built.

1. Check out the ticket's branch. Read the ticket, its Log, and the full diff against `main`.
2. Check, and note each in your log line:
   - every acceptance criterion the builder ticked is really met, and unticked ones are explained
   - `node tools/browser-check.mjs` passes (or say why you couldn't run it)
   - CLAUDE.md design rules: touch target size, little reading, never punishing, no new dependencies
   - science content against PLAN.md §9, naming the guardrails you checked
   - if any file the game loads changed: `update-sw.mjs` was run and `APP_VERSION` bumped
   - nothing outside the ticket's scope changed, and no personal information anywhere
3. **Don't rewrite the work.** The reviewer only edits the ticket file. A one-word typo fix is fine; anything bigger goes back to the builder.
4. Finish with one of:
   - **approve:** set `status: approved` and log `review: approved`, plus anything the owner should try on the iPad
   - **send back:** set `status: changes` and log `review: changes`, followed by a numbered list of what must change. Keep it to real problems, not style preferences
5. Commit to the ticket branch as `ticket <id>: review`. The owner still merges and sets `done`.

After two rounds of changes, set `status: blocked` instead and ask the owner to decide.

## Log entries

One line each, newest at the bottom:

```
- YYYY-MM-DD [claude|copilot] (model): what happened
```

Example: `- 2026-10-07 [copilot] (gpt-5.5): added sound effects`. Coordinators log as `[claude|copilot] (model) coordinator:` and reviewers start their line with `review:`. Include the model name if you know it; leave out the parentheses if you don't.
