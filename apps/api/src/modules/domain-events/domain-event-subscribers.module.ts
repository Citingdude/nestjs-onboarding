import { Module } from '@nestjs/common'
import { SyncUserFromZitadelSubscriberModule } from '#src/modules/auth/users/use-cases/sync-user-from-zitadel/sync-user-from-zitadel.subscriber.module.js'
import { DomainEventLogSubscriberModule } from '#src/modules/domain-event-log/use-cases/log-event/domain-event-log-subscriber.module.js'
import { AssignDefaultRoleToUserSubscriberModule } from '#src/modules/auth/users/use-cases/assign-default-role-to-user/assign-default-role-to-user-subscriber.module.js'
import { ClearRolePermissionsCacheSubscriberModule } from '#src/modules/auth/roles/use-cases/clear-role-permissions-cache/clear-role-permissions-cache-subscriber.module.js'
import { UserTypesenseSubscriberModule } from '#src/modules/auth/users/typesense/user-typesense.subscriber.module.js'
import { CreateUserNotificationsSubscriberModule } from '#src/modules/notification/use-cases/create-user-notifications/create-user-notifications.subscriber-module.js'
import { SendAppNotificationSubscriberModule } from '#src/modules/notification/use-cases/send-app-notification/send-app-notification.subscriber.module.js'
import { ContactTypesenseSubscriberModule } from '#src/app/contact/typesense/contact.typesense-subscriber.module.js'
import { AssignDefaultNotificationPreferencesToUserSubscriberModule } from '#src/modules/notification/use-cases/assign-default-notification-preferences-to-user/assign-default-notification-preferences-to-user.subscriber.module.js'
import { ContactCreatedIntegrationSubscriberModule } from '#src/app/contact/use-cases/create-contact/integration/contact-created.integration.subscriber.module.js'
import { ContactDeletedIntegrationSubscriberModule } from '#src/app/contact/use-cases/delete-contact/integration/contact-deleted.integration.subscriber.module.js'
import { ContactUpdatedIntegrationSubscriberModule } from '#src/app/contact/use-cases/update-contact/integration/contact-updated.integration.subscriber.module.js'
import { ClearUserRoleCacheSubscriberModule } from '#src/modules/auth/users/use-cases/clear-user-role-cache/clear-user-role-cache.subscriber.module.js'
import { EmitExportFailedModule } from '#src/app/export/use-cases/emit-export-failed/emit-export-failed.module.js'
import { EmitExportSucceededModule } from '#src/app/export/use-cases/emit-export-succeeded/emit-export-succeeded.module.js'

@Module({
  imports: [
    AssignDefaultNotificationPreferencesToUserSubscriberModule,
    AssignDefaultRoleToUserSubscriberModule,

    ClearRolePermissionsCacheSubscriberModule,
    ClearUserRoleCacheSubscriberModule,

    ContactCreatedIntegrationSubscriberModule,
    ContactDeletedIntegrationSubscriberModule,
    ContactTypesenseSubscriberModule,
    ContactUpdatedIntegrationSubscriberModule,

    CreateUserNotificationsSubscriberModule,

    EmitExportFailedModule,
    EmitExportSucceededModule,

    DomainEventLogSubscriberModule,

    SendAppNotificationSubscriberModule,
    SyncUserFromZitadelSubscriberModule,

    UserTypesenseSubscriberModule
  ]
})
export class DomainEventSubscribersModule {}
