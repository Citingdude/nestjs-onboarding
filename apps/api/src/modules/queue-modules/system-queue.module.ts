import { Module } from '@nestjs/common'
import { MailQueueModule } from '@wisemen/nestjs-mail'
import { MigrateCollectionsJobModule } from '#src/modules/typesense/use-cases/migrate-collections/job/migrate-collections-job.module.js'
import { SyncUserFromZitadelJobModule } from '#src/modules/auth/users/use-cases/sync-user-from-zitadel/sync-user-from-zitadel.job.module.js'
import { SyncTypesenseJobModule } from '#src/modules/typesense/use-cases/sync-collection/sync-typesense-collection-job.module.js'
import { AssignDefaultNotificationPreferencesToUserJobModule } from '#src/modules/notification/use-cases/assign-default-notification-preferences-to-user/assign-default-notification-preferences-to-user.job.module.js'
import { CreateNotificationJobModule } from '#src/modules/notification/use-cases/create-notification/create-notification.job.module.js'
import { CreateUserNotificationsJobModule } from '#src/modules/notification/use-cases/create-user-notifications/create-user-notifications.job-module.js'
import { AddNewNotificationTypeToPreferencesJobModule } from '#src/modules/notification/use-cases/add-new-notification-type-to-preferences/add-new-notification-type-to-preferences.job.module.js'
import { ExportContactsJobModule } from '#src/app/contact/use-cases/export-contacts/job/export-contacts-job.module.js'
import { ExportDomainEventLogJobModule } from '#src/modules/domain-event-log/use-cases/export-domain-event-log/export-domain-event-log-job.module.js'
import { LocalizationModule } from '#src/modules/localization/modules/localization.module.js'
import { SyncFeatureFlagConfigJobModule } from '#src/modules/feature-flag/use-cases/sync-feature-flag-config/sync-feature-flag-config.job.module.js'
import { ResizeFileJobModule } from '#src/modules/files/use-cases/resize-file/job/resize-file.job.module.js'
import { DefaultMailModule } from '#src/modules/mail/default-mail.module.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'

@Module({
  imports: [
    LocalizationModule,

    AddNewNotificationTypeToPreferencesJobModule,
    AssignDefaultNotificationPreferencesToUserJobModule,
    CreateNotificationJobModule,
    CreateUserNotificationsJobModule,
    ExportContactsJobModule,
    ExportDomainEventLogJobModule,
    SyncFeatureFlagConfigJobModule,
    SyncTypesenseJobModule,
    SyncUserFromZitadelJobModule,
    MigrateCollectionsJobModule,
    ResizeFileJobModule,

    MailQueueModule.forRoot({
      imports: [DefaultMailModule],
      queueName: QueueName.SYSTEM
    })
  ]
})
export class SystemQueueModule {}
