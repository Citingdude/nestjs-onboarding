import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { PgBossScheduler } from '@wisemen/pgboss-nestjs-job'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { MigrateNotificationTypesCommand } from './migrate-notification-types.command.js'
import { NotificationTypesMigratedEvent } from './notification-types-migrated.event.js'
import { NotificationMigration } from '#src/modules/notification/entities/notification-migration.entity.js'
import { MigrationAlreadyPerformedError } from '#src/modules/notification/errors/migration-already-performed.error.js'
import { AddNewNotificationTypeToPreferencesJob } from '#src/modules/notification/use-cases/add-new-notification-type-to-preferences/add-new-notification-type-to-preferences.job.js'
import { NotificationBuilder } from '#src/modules/notification/entities/notification-migration.entity.builder.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { notificationCategory } from '#src/modules/notification/notification-category.js'

@Injectable()
export class MigrateNotificationTypesUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(NotificationMigration)
    private readonly notificationMigrationRepo: TypeOrmRepository<NotificationMigration>,
    private jobScheduler: PgBossScheduler,
    private eventEmitter: DomainEventEmitter
  ) {}

  async execute (command: MigrateNotificationTypesCommand): Promise<void> {
    const existingMigrations = await this.notificationMigrationRepo.find()
    const jobs: AddNewNotificationTypeToPreferencesJob[] = []
    const notificationMigrations: NotificationMigration[] = []

    for (const notificationType of command.types) {
      this.assertMigrationHasNotYetBeenPerformed(existingMigrations, notificationType)

      const isNewCategory = !this.categoryAlreadyMigrated(existingMigrations, notificationType)
      notificationMigrations.push(
        new NotificationBuilder()
          .withType(notificationType)
          .build()
      )

      const job = new AddNewNotificationTypeToPreferencesJob(notificationType, isNewCategory)
      jobs.push(job)
    }

    await transaction(this.dataSource, async () => {
      await this.notificationMigrationRepo.insert(notificationMigrations)
      await this.jobScheduler.scheduleJobs(jobs)
      await this.eventEmitter.emitOne(new NotificationTypesMigratedEvent(command.types))
    })
  }

  private assertMigrationHasNotYetBeenPerformed (
    existingMigrations: NotificationMigration[],
    type: NotificationType
  ): void {
    for (const migration of existingMigrations) {
      if (migration.type === type) {
        throw new MigrationAlreadyPerformedError(type)
      }
    }
  }

  private categoryAlreadyMigrated (
    existingMigrations: NotificationMigration[],
    type: NotificationType
  ): boolean {
    const category = notificationCategory(type)

    for (const migration of existingMigrations) {
      if (category === notificationCategory(migration.type)) {
        return true
      }
    }
    return false
  }
}
