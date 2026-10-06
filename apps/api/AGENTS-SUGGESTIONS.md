# Agent suggestions

- The existing `DomainEventLogArchive` decorator `@Index('upper(archive.range)')`
  treats the expression as an index name and generates invalid `CREATE INDEX ... ()`
  SQL. Align its index metadata with the archive migration before generating future
  schema changes. Review generated migrations for unrelated archive and notification
  changes; keep feature migrations limited to the intended schema transition.
