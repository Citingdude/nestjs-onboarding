import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NatsPublisher, natsSubject, type NatsPublisherStreamEventWithSubject } from '@wisemen/nestjs-nats'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { UserNotificationCreatedIntegrationEvent, UserNotificationCreatedNatsSubject } from './send-app-notification.integration.event.js'
import { UserNotificationCreatedEvent } from '#src/modules/notification/use-cases/create-user-notifications/user-notification.created.event.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'

@Injectable()
export class SendAppNotificationSubscriber {
  constructor (
    private natsPublisher: NatsPublisher,
    private config: ConfigService
  ) {}

  @Subscribe(UserNotificationCreatedEvent)
  async on (events: UserNotificationCreatedEvent[]): Promise<void> {
    const appEvents = events.filter(event => event.content.channel === NotificationChannel.APP)

    const integrationEvents: NatsPublisherStreamEventWithSubject[] = appEvents.map((event) => {
      return {
        event: new UserNotificationCreatedIntegrationEvent(event),
        onSubject: natsSubject(UserNotificationCreatedNatsSubject, {
          userUuid: event.content.userUuid,
          notificationUuid: event.content.notificationUuid,
          env: this.config.getOrThrow('NODE_ENV')
        })
      }
    })

    await this.natsPublisher.publishToStream(integrationEvents)
  }
}
