import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { NotificationCreatedEvent } from './notification-created.event.js'
import { NotificationCreatedResponse } from './notification-created.response.js'
import { Notification } from '#src/modules/notification/entities/notification.entity.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationBuilder } from '#src/modules/notification/entities/notification.entity.builder.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Injectable()
export class CreateNotificationUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    @InjectRepository(Notification)
    private readonly notificationRepo: TypeOrmRepository<Notification>
  ) {}

  async createNotification (
    createdByUserUuid: UserUuid | null,
    type: NotificationType,
    meta: object
  ): Promise<NotificationCreatedResponse> {
    const notification = new NotificationBuilder()
      .withCreatedByUserUuid(createdByUserUuid)
      .withType(type)
      .withMeta(meta)
      .build()

    await transaction(this.dataSource, async () => {
      await this.notificationRepo.insert(notification)
      await this.eventEmitter.emitOne(new NotificationCreatedEvent(notification.uuid, type))
    })

    return new NotificationCreatedResponse(notification.uuid)
  }
}
