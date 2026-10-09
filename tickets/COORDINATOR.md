# Coordinator

The coordinator decides **who builds and who reviews** each ticket, so the work is split between Claude and GitHub Copilot and neither plan's usage runs out. It doesn't write app code. Either tool can coordinate: in Claude Code say "coordinate the tickets"; in Copilot pick the **coordinator** agent.

## What it does

1. Read [PROTOCOL.md](PROTOCOL.md) and every `tickets/NNNN-*.md`.
2. For every ticket with `status: todo` whose `agent`, `model`, `reviewer` or `review_model` is `any` or blank, choose them using the rules below. Leave anything the owner has already filled in alone.
3. Write the choices into each ticket's front matter and add one log line, e.g.
   `- 2026-10-08 [claude] (claude-opus-5-5) coordinator: builder copilot gpt-5.5 (medium new game), reviewer claude claude-sonnet-5-5`
4. Commit only the ticket files, straight to `main`, as `tickets: assign builders and reviewers`. Ticket files aren't app code, so this is the one thing allowed on `main`.
5. Reply with a short table: ticket, builder, reviewer, why. Then say which ticket each tool should start with.

If asked about one ticket ("assign 0009"), do just that one.

## Rules for choosing

**Split the tools.**
- The reviewer is the other tool from the builder. Only use the same tool for both if the owner says one tool is out of usage.
- Across the open tickets, aim for about half built by each tool. Count the tickets already assigned (`todo`, `in-progress`, `review`, `changes`) and give the next one to the tool with fewer.
- Tickets that run in parallel (their Context says so) go to different builders where possible, so both tools work at once.

**Match the model to the job.**

| Job | Builder model | Reviewer model |
|---|---|---|
| New game, tricky logic (saving, timers, the service worker), or a lot of science content | strongest: `claude-opus-5-5` or `gpt-5.5` | mid: `claude-sonnet-5-5` or `gpt-5.5` |
| Normal feature or fix inside one game | mid: `claude-sonnet-5-5` or `gpt-5.5` | mid |
| Docs, STATUS.md, one-line or config changes | light: `claude-haiku-5-5` or Copilot's included model | light |

Science content always gets at least a mid reviewer, because accuracy (PLAN.md §9) is what the review is mostly for.

**Model names.** Claude models use their API ids (`claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`). Copilot models use the name shown in Copilot's model picker, lowercase (`gpt-5.5`). If the owner adds a model roster to Agent HQ's `settings.json`, use only names from it.

**Owner overrides win.** If the owner says "Copilot is out for the week" or "use Opus for this one", follow that and note it in the log line.
