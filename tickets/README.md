# Tickets

Each ticket is one markdown file in this folder: `NNNN-short-slug.md`. Agents follow [PROTOCOL.md](PROTOCOL.md).

## Create a ticket from your phone

1. In the GitHub app or github.com, open `tickets/TEMPLATE.md` and copy its text.
2. **Add file → Create new file** in `tickets/`, named with the next unused number, e.g. `0007-rain-sounds.md`.
3. Paste, then fill in `id`, `title`, `priority`, `depends_on`, `agent`, Goal, Context, and Acceptance criteria. Leave `status: todo` and the Log empty.
4. Commit straight to `main`. (Ticket files aren't app code.)

Keep tickets free of personal information: the repo may be public.

## Start work in VS Code

1. **Coordinate:** assign a builder and reviewer to every open ticket.
   - Claude Code: "coordinate the tickets" (uses the `ticket-coordinator` agent)
   - Copilot: pick the **coordinator** agent and say "coordinate"
   Leave `agent` and `model` blank or `any` when you create a ticket and the coordinator fills them in, or fill them in yourself to choose. See [COORDINATOR.md](COORDINATOR.md) for how it splits the work.
2. **Build:** "work the next ticket" in Claude Code, or the Copilot coordinator's **Build this ticket** button. The builder stops at `status: review` or `status: blocked`.
3. **Review:** "review the next ticket" in Claude Code (`ticket-reviewer` agent), or the Copilot **reviewer** agent. The reviewer is the other tool from the builder. It sets `approved`, or `changes` with a numbered list that goes back to the builder.

## Your part

1. When a ticket is `approved`, read the review line in its Log and try the app if it asks you to.
2. Merge the branch into `main` (a pull request on GitHub works from your phone). The GitHub check must be green.
3. On `main`, set the ticket's `status: done`.

If a ticket is `blocked`, its Log ends with a question for you.
