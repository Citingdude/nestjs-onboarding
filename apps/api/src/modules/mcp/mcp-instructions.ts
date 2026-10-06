/**
 * The MCP `instructions` string, returned in the initialize result and read once per session.
 *
 * A model connecting for the first time sees tool names, titles and JSON schemas and nothing
 * else. It cannot infer what this product is, what must be resolved before anything else works,
 * or which everyday word means something narrower here.
 *
 * This is spent on every session, so keep it short. A fact belongs here only when getting it
 * wrong would cost a failed tool call. Everything a well-named tool and a good
 * `@ApiProperty({ description })` already convey belongs there instead, not here.
 *
 * Replace the body below when initializing a project. The headings are the shape that earns its
 * tokens; drop any section the project has nothing to say about.
 */
export const MCP_INSTRUCTIONS = `<One sentence on what this product is and how its main \
entities relate.>

## Start here

<What a caller must resolve before anything else — a tenant, an account, a workspace — and the \
tool that returns it. Name the argument each tool takes it as, and say that the tool schema is \
authoritative when they disagree.>

## Vocabulary

<Only terms whose everyday meaning is wrong here, one line each. Skip anything self-evident \
from the tool name.>

## Conventions

<Cross-cutting argument formats: money units, locales, date and time format, how pagination is \
requested, anything that looks optional but is not.>

## Care

Confirm with the user before deleting anything, and before anything that emails or notifies real \
people.
`
