import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import type { NotificationMigration } from '#src/modules/notification/entities/notification-migration.entity.js'
import { MigrateNotificationTypesUseCase } from '#src/modules/notification/use-cases/migrate-notification-types/migrate-notification-types.use-case.js'
import { NotificationBuilder } from '#src/modules/notification/entities/notification-migration.entity.builder.js'
import { MigrateNotificationTypesCommandBuilder } from '#src/modules/notification/use-cases/migrate-notification-types/migrate-notification-types.command.builder.js'
import { MigrationAlreadyPerformedError } from '#src/modules/notification/errors/migration-already-performed.error.js'
import { NotificationTypesMigratedEvent } from '#src/modules/notification/use-cases/migrate-notification-types/notification-types-migrated.event.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('MigrateNotificationsUseCase - Unit Tests', () => {
  before(() => TestBench.setupUnitTest())

  it('Should throw error when migration already exists', async () => {
    const repo = createStubInstance(TypeOrmRepository<NotificationMigration>)
    const jobScheduler = createStubInstance(PgBossScheduler)
    const eventEmitter = createStubInstance(DomainEventEmitter)

    repo.find.resolves([
      new NotificationBuilder()
        .withType(NotificationType.USER_CREATED)
        .build()
    ])

    const useCase = new MigrateNotificationTypesUseCase(
      stubDataSource(),
      repo,
      jobScheduler,
      eventEmitter
    )

    const command = new MigrateNotificationTypesCommandBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .build()

    await expect(useCase.execute(command)).rejects.toThrow(MigrationAlreadyPerformedError)
  })

  it(`Should schedule jobs for every type in command, 
    if there is already a migration for a notification with the same category isNewCategory
     should be false else isNewCategory is true`, async () => {
    const repo = createStubInstance(TypeOrmRepository<NotificationMigration>)
    const jobScheduler = createStubInstance(PgBossScheduler)
    const eventEmitter = createStubInstance(DomainEventEmitter)

    repo.find.resolves([])

    const useCase = new MigrateNotificationTypesUseCase(
      stubDataSource(),
      repo,
      jobScheduler,
      eventEmitter
    )

    const command = new MigrateNotificationTypesCommandBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .build()

    await useCase.execute(command)

    expect(repo.insert.firstCall.firstArg).toHaveLength(1)
    expect(jobScheduler.scheduleJobs.firstCall.firstArg.length).toBe(1)
    expect(jobScheduler.scheduleJobs.firstCall.firstArg).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          data: {
            type: NotificationType.USER_CREATED,
            isNewCategory: true
          }
        })
      ])
    )
  })

  it(`Emits a NotificationTypesMigrated event`, async () => {
    const repo = createStubInstance(TypeOrmRepository<NotificationMigration>)
    const jobScheduler = createStubInstance(PgBossScheduler)
    const eventEmitter = createStubInstance(DomainEventEmitter)

    repo.find.resolves([])

    const useCase = new MigrateNotificationTypesUseCase(
      stubDataSource(),
      repo,
      jobScheduler,
      eventEmitter
    )

    const command = new MigrateNotificationTypesCommandBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .build()

    await useCase.execute(command)

    expect(eventEmitter).toHaveEmitted(new NotificationTypesMigratedEvent(command.types))
  })
})
