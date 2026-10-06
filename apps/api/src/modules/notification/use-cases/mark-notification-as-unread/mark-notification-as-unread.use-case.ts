import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { NotificationUnreadEvent } from './mark-notification-as-unread.event.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { UserNotificationNotFoundError } from '#src/modules/notification/errors/user-notification-not-found.error.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'

@Injectable()
export class MarkNotificationAsUnreadUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(UserNotification)
    private readonly repository: TypeOrmRepository<UserNotification>,
    private readonly authContext: AuthContext,
    private readonly eventEmitter: DomainEventEmitter
  ) {}

  async execute (notificationUuid: NotificationUuid): Promise<void> {
    const userUuid = this.authContext.getUserUuidOrFail()
    const userNotificationExists = await this.repository.existsBy({
      notificationUuid,
      userUuid,
      channel: NotificationChannel.APP
    })

    if (!userNotificationExists) {
      throw new UserNotificationNotFoundError(notificationUuid)
    }

    await transaction(this.dataSource, async () => {
      await this.repository.update(
        { notificationUuid, userUuid, channel: NotificationChannel.APP },
        { readAt: null }
      )

      await this.eventEmitter.emitOne(new NotificationUnreadEvent(notificationUuid, userUuid))
    })
  }
}
