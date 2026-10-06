import { describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventLogBuilder } from '#src/modules/domain-event-log/domain-event-log.entity.builder.js'
import { DomainEventLogContext } from '#src/modules/domain-event-log/modules/domain-event-log-context/domain-event-log.context.js'
import type { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'

describe('DomainEventLogContext unit tests', () => {
  it('inserts the captured logs', async () => {
    const repo = createStubInstance(TypeOrmRepository<DomainEventLog>)
    const context = new DomainEventLogContext(repo)

    await context.runAndCaptureLogs(() => {
      context.addLogs(new DomainEventLogBuilder().build())
    })

    expect(repo.insert.called).toBe(true)
  })

  it('inserts all captured logs together', async () => {
    const repo = createStubInstance(TypeOrmRepository<DomainEventLog>)
    const context = new DomainEventLogContext(repo)

    await context.runAndCaptureLogs(async () => {
      context.addLogs(new DomainEventLogBuilder().build())
      context.addLogs(new DomainEventLogBuilder().build())

      await context.runAndCaptureLogs(() => {
        context.addLogs(new DomainEventLogBuilder().build())
      })
    })

    expect(repo.insert.callCount).toBe(1)
    expect(repo.insert.firstCall.firstArg).toHaveLength(3)
  })
})
