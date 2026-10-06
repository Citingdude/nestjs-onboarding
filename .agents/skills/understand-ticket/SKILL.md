---
name: understand-ticket
description: Thoroughly understand a Linear ticket before any code is touched — pull the ticket, its comments, and related/linked tickets, then produce a requirements brief and a list of open questions. Use at the start of work on any ticket (e.g. "work on TBN-123").
---

# Understand a Linear ticket

Goal: leave this step with a complete, written understanding of WHAT is being asked
and WHY — or a precise list of questions if that's not possible. **Never proceed to
planning with unresolved ambiguity** — `apps/api/AGENTS.md` (Intake & Plan) requires
confirming scope, constraints, and acceptance criteria, and asking for missing context early.

## 1. Get the ticket

**Default**: Use a Linear MCP server / connector, if one is configured. 

**Fallback: ask the user to paste the ticket content** — description, comments, and any
linked/related ticket text. This is the suboptimal path.

## 2. Investigate the surrounding context

Don't stop at the ticket body. Check, and fetch when relevant:

- **Comments** — decisions and clarifications often live there, not in the description.
- **Parent / sub-issues / blocked-by / related tickets** — fetch any that could change
  the requirements or that this ticket builds on.
- **Tickets mentioned by identifier** (TBN-xxx) in the description or comments.
- **Sibling tickets**: if this is one of a series doing the same thing for different
  models/entities, find a sibling that's already DONE — its implementation is the
  template for yours (`git log --all --grep "TBN-<sibling>"` shows exactly what it touched).
- Attached designs, spreadsheets, or files referenced in the ticket.

## 3. Produce a requirements brief

Write a short brief containing:

- **Goal** — one sentence: what changes for the user/system and why.
- **Type** — feature / bug / data change. For a bug: the reported symptom, and a note
  that the root cause must be identified before fixing.
- **Acceptance criteria** — concrete, checkable bullets (derive them if the ticket
  doesn't state them explicitly, and mark derived ones as such).
- **In scope / out of scope** — especially what neighboring tickets already cover.
- **Precedent** — sibling/related ticket whose implementation should be mirrored, if any.
- **Open questions** — anything ambiguous, contradictory, or unstated that affects
  the implementation.

## 4. Gate

- If **open questions** is non-empty: present the brief and the questions, and STOP.
  The questions go to the ticket reporter or a senior — do not answer them yourself
  with assumptions.
- If empty: the brief is the input to planning — follow the **Intake & Plan** section
  in `apps/api/AGENTS.md` (read the modules you'll touch, propose a short plan with
  milestones/risks).
