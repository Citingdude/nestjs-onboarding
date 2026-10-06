import { Module } from '@nestjs/common'
import { GetMyNotificationPreferencesModule } from './use-cases/get-my-notification-preferences/get-my-notification-preferences.module.js'
import { GetNotificationTypesConfigModule } from './use-cases/get-notification-types-config/get-notification-types-config.module.js'
import { UpdateMyChannelNotificationPreferenceModule } from './use-cases/update-my-channel-notification-preference/update-my-channel-notification-preference.module.js'

import { GetMyNotificationsModule } from './use-cases/get-my-notifications/get-my-notifications.module.js'
import { UpdateMyNotificationTypePreferenceModule } from './use-cases/update-my-notification-type-preferences/update-my-notification-type-preference.module.js'
import { MarkNotificationAsReadModule } from './use-cases/mark-notification-as-read/mark-notification-as-read.module.js'
import { MarkNotificationAsUnreadModule } from './use-cases/mark-notification-as-unread/mark-notification-as-unread.module.js'
import { UpdateMyNotificationPreferencePresetModule } from './use-cases/update-my-notifcation-preference-preset/update-my-notification-preference-preset.module.js'
import { MigrateNotificationTypesModule } from './use-cases/migrate-notification-types/migrate-notification-types.module.js'
import { SendTestNotificationModule } from './use-cases/send-test-notification/send-test-notification.module.js'
import { ViewUserNotificationDetailModule } from './use-cases/view-user-notification-detail/view-user-notification-detail.module.js'
import { ViewUnreadNotificationsCountModule } from './use-cases/view-unread-notifications-count/view-unread-notifications-count.module.js'
import { MarkAllNotificationAsReadModule } from './use-cases/mark-all-notification-as-read/mark-all-notification-as-read.module.js'

@Module({
  imports: [
    GetMyNotificationPreferencesModule,
    GetNotificationTypesConfigModule,
    UpdateMyChannelNotificationPreferenceModule,
    SendTestNotificationModule,
    GetMyNotificationsModule,
    ViewUnreadNotificationsCountModule,
    ViewUserNotificationDetailModule,
    MarkAllNotificationAsReadModule,
    UpdateMyNotificationTypePreferenceModule,
    MarkNotificationAsReadModule,
    MarkNotificationAsUnreadModule,
    UpdateMyNotificationPreferencePresetModule,
    MigrateNotificationTypesModule
  ]
})
export class NotificationModule {}
