import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { MigrateNotificationTypesController } from './migrate-notification-types.controller.js'
import { MigrateNotificationTypesUseCase } from './migrate-notification-types.use-case.js'
import { DefaultPgBossSchedulerModule } from '#src/modules/pgboss/default-pgboss-scheduler.module.js'
import { NotificationMigration } from '#src/modules/notification/entities/notification-migration.entity.js'

@Module({
  imports: [
    DefaultPgBossSchedulerModule,
    TypeOrmModule.forFeature([NotificationMigration])
  ],
  controllers: [MigrateNotificationTypesController],
  providers: [MigrateNotificationTypesUseCase]
})
export class MigrateNotificationTypesModule {}
