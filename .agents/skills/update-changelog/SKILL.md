---
name: update-changelog
description: Update the root changelog when documenting completed changes in template projects, using the  description, and migration format.
---

## Changelog location

Update the repository-root `CHANGELOG.md`. Do not create or update an unreleased section.

## Entry format

Write each change as exactly these sections:

```md
## <short title of the change with ticket if any>

### Description
<what changed and why>

### Migration
<migration steps, or "None">
```

Use a concise, descriptive title. The description should state the user-visible or developer and agent-relevant change and its reason when known. Migration instructions must be actionable when a consumer needs to change configuration, code, or data; otherwise write `None`.

## Constraints

- Do not use week numbers, dates, `Unreleased`, conventional-commit bullets, change-type categories, or a document-level changelog heading.
- Do not add sections beyond the title, Description, and Migration sections for an entry.
- Preserve existing entries unless the request is to rework or remove them.
- Only update the changelog in the following repos:
  - nestjs-project-template
  - wisemen-project-template
  - wisemen-tenant-template
