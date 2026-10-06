import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource, IsNull } from 'typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { AllNotificationMarkedAsReadEvent } from './all-notifications-marked-as-read.event.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Injectable()
export class MarkAllNotificationAsReadUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(UserNotification)
    private readonly repository: TypeOrmRepository<UserNotification>,
    private readonly eventEmitter: DomainEventEmitter
  ) {}

  async execute (userUuid: UserUuid): Promise<void> {
    await transaction(this.dataSource, async () => {
      await this.repository.update(
        { userUuid, channel: NotificationChannel.APP, readAt: IsNull() },
        { readAt: new Date() }
      )

      await this.eventEmitter.emitOne(new AllNotificationMarkedAsReadEvent(userUuid))
    })
  }
}
