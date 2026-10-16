# Suggested testing guidance

- Integration tests that require empty tables should establish that state in
  `beforeEach` inside the test transaction. Cleanup only in `afterEach` leaves
  the first test exposed to existing rows in the local test database.
