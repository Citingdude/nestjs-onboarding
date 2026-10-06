import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'
import { UserNotificationCreatedEvent } from '#src/modules/notification/use-cases/create-user-notifications/user-notification.created.event.js'
import { EnvType } from '#src/modules/config/env.enum.js'

export class UserNotificationCreatedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  userUuid: UserUuid

  @ApiProperty({ type: 'string', format: 'uuid' })
  notificationUuid: NotificationUuid
}

export class UserNotificationCreatedIntegrationEvent extends
  IntegrationEvent<UserNotificationCreatedIntegrationEventContent> {
  @ApiProperty({
    enumName: 'UserNotificationCreatedIntegrationEventType',
    enum: [IntegrationEventType.USER_NOTIFICATION_CREATED]
  })
  declare type: IntegrationEventType.USER_NOTIFICATION_CREATED

  @ApiProperty({ type: UserNotificationCreatedIntegrationEventContent })
  declare data: UserNotificationCreatedIntegrationEventContent

  constructor (event: UserNotificationCreatedEvent) {
    super({
      version: '0.0.1',
      type: IntegrationEventType.USER_NOTIFICATION_CREATED,
      data: {
        userUuid: event.content.userUuid,
        notificationUuid: event.content.notificationUuid
      }
    })
  }
}

export const UserNotificationCreatedNatsSubject = 'project-template.{env}.user.{userUuid}.notification.{notificationUuid}.created'
export const UserNotificationCreatedChannel = createChannel(UserNotificationCreatedNatsSubject, {
  parameters: {
    env: {
      enum: Object.values(EnvType),
      description: 'The environment from which the event originates',
      examples: [EnvType.DEVELOPMENT]
    },
    userUuid: {
      description: 'The uuid of the user'
    },
    notificationUuid: {
      description: 'The uuid of the notification'
    }
  },
  operations: {
    sendUserNotificationCreated: {
      action: 'send',
      summary: 'this is message is sent when a user receives a notification',
      messages: [UserNotificationCreatedIntegrationEvent]
    }
  }
})
