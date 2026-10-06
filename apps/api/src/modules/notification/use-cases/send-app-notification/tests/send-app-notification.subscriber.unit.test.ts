import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { ConfigService } from '@nestjs/config'
import { NatsPublisher } from '@wisemen/nestjs-nats'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { SendAppNotificationSubscriber } from '#src/modules/notification/use-cases/send-app-notification/send-app-notification.subscriber.js'
import { UserNotificationCreatedEvent } from '#src/modules/notification/use-cases/create-user-notifications/user-notification.created.event.js'
import { UserNotificationBuilder } from '#src/modules/notification/entities/user-notification.entity.builder.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { EnvType } from '#src/modules/config/env.enum.js'

describe('SendAppNotificationSubscriber - Unit Tests', () => {
  before(() => TestBench.setupUnitTest())

  it('Only published app events on nats', async () => {
    const natsPublisher = createStubInstance(NatsPublisher)
    const config = createStubInstance(ConfigService)
    config.getOrThrow.returns(EnvType.TEST)

    const subscriber = new SendAppNotificationSubscriber(natsPublisher, config)
    await subscriber.on([
      new UserNotificationCreatedEvent(
        new UserNotificationBuilder()
          .withChannel(NotificationChannel.APP)
          .build()
      ),
      new UserNotificationCreatedEvent(
        new UserNotificationBuilder()
          .withChannel(NotificationChannel.PUSH)
          .build()
      )
    ])

    expect(natsPublisher.publishToStream.called).toBe(true)
    expect(natsPublisher.publishToStream.firstCall.args).toHaveLength(1)
  })
})
