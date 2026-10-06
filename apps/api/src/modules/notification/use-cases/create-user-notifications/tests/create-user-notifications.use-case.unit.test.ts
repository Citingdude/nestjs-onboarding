import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { NotificationBuilder } from '#src/modules/notification/entities/notification.entity.builder.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { CreateUserNotificationsRepository } from '#src/modules/notification/use-cases/create-user-notifications/create-user-notifications.repository.js'
import { CreateUserNotificationsUseCase } from '#src/modules/notification/use-cases/create-user-notifications/create-user-notifications.use-case.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

describe('CreateUserNotificationsUseCase - Unit Tests', () => {
  before(() => TestBench.setupUnitTest())

  it('Creates 2 notifications for 2 subscribed users', async () => {
    const repo = createStubInstance(CreateUserNotificationsRepository)

    const notification = new NotificationBuilder()
      .withType(NotificationType.USER_CREATED)
      .withMeta({ userName: 'John Doe' })
      .withCreatedByUserUuid(generateUuid<UserUuid>())
      .build()

    repo.findNotificationOrFail.resolves(notification)

    repo.getSubscribedUsers.callsFake(
      async function* () {
        yield await new Promise(res => res([
          { uuid: generateUuid() },
          { uuid: generateUuid() }
        ]))
      }
    )

    const useCase = new CreateUserNotificationsUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      repo
    )

    await useCase.execute(notification.uuid)

    expect(repo.insertUserNotifications.firstCall.firstArg).toHaveLength(2)
  })

  it('Emits 2 events for 2 subscribers', async () => {
    const repo = createStubInstance(CreateUserNotificationsRepository)

    const notification = new NotificationBuilder()
      .withType(NotificationType.USER_CREATED)
      .withMeta({ userName: 'John Doe' })
      .withCreatedByUserUuid(generateUuid<UserUuid>())
      .build()

    repo.findNotificationOrFail.resolves(notification)

    repo.getSubscribedUsers.callsFake(
      async function* () {
        yield await new Promise(res => res([
          { uuid: generateUuid() },
          { uuid: generateUuid() }
        ]))
      }
    )

    const eventEmitter = createStubInstance(DomainEventEmitter)
    const useCase = new CreateUserNotificationsUseCase(
      stubDataSource(),
      eventEmitter,
      repo
    )

    await useCase.execute(notification.uuid)

    expect(eventEmitter.emit.firstCall.firstArg).toHaveLength(2)
  })
})
