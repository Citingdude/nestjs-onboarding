import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { CreateNotificationUseCase } from '#src/modules/notification/use-cases/create-notification/create-notification.use-case.js'
import type { Notification } from '#src/modules/notification/entities/notification.entity.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationCreatedEvent } from '#src/modules/notification/use-cases/create-notification/notification-created.event.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('CreateNotificationUseCase - Unit Tests', () => {
  before(() => TestBench.setupUnitTest())

  it('Emits a NotificationCreated event and job', async () => {
    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new CreateNotificationUseCase(
      stubDataSource(),
      eventEmitter,
      createStubInstance(TypeOrmRepository<Notification>)
    )

    const type = NotificationType.USER_CREATED
    const { uuid } = await useCase.createNotification(null, type, { someKey: 'someValue' })

    expect(eventEmitter).toHaveEmitted(new NotificationCreatedEvent(uuid, type))
  })
})
