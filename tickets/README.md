# Tickets

Each ticket is one markdown file in this folder: `NNNN-short-slug.md`. Agents follow [PROTOCOL.md](PROTOCOL.md).

## Create a ticket from your phone

1. In the GitHub app or github.com, open `tickets/TEMPLATE.md` and copy its text.
2. **Add file → Create new file** in `tickets/`, named with the next unused number, e.g. `0007-rain-sounds.md`.
3. Paste, then fill in `id`, `title`, `priority`, `depends_on`, `agent`, Goal, Context, and Acceptance criteria. Leave `status: todo` and the Log empty.
4. Commit straight to `main`. (Ticket files aren't app code.)

Keep tickets free of personal information: the repo may be public.

## Start work in VS Code

- **Claude Code:** "Work ticket 0007", or "work the next ticket".
- **Copilot:** pick the **coordinator** agent and say "work the next ticket", or tell normal Copilot chat "work ticket 0007".

The agent works on a branch `ticket/<id>-<slug>` and stops at `status: review` (finished) or `status: blocked` (has a question for you in the Log).

## Review loop

1. Check the branch: read the ticket's Log, look at the diff, and try the app.
2. If it's good, merge the branch into `main` (a pull request on GitHub works from your phone).
3. On `main`, set the ticket's `status: done`.
4. If it's blocked, answer the question in the Log on the ticket branch, set `status: in-progress`, and ask the agent to continue.
