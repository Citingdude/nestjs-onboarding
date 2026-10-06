import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import type { NotificationUuid } from '#src/modules/notification/entities/notification.uuid.js'
import { NotificationResponse } from '#src/modules/notification/notification.response.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import { UserNotificationNotFoundError } from '#src/modules/notification/errors/user-notification-not-found.error.js'

@Injectable()
export class ViewUserNotificationDetailUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly authContext: AuthContext,
    @InjectRepository(UserNotification)
    private readonly repository: TypeOrmRepository<UserNotification>
  ) {}

  async execute (notificationUuid: NotificationUuid): Promise<NotificationResponse> {
    const userUuid = this.authContext.getUserUuidOrFail()

    const notification = await readonly(this.dataSource, async () =>
      await this.repository.findOne({
        where: { userUuid, notificationUuid, channel: NotificationChannel.APP },
        relations: { notification: { createdByUser: true } }
      })
    )

    if (notification === null) {
      throw new UserNotificationNotFoundError(notificationUuid)
    }

    return new NotificationResponse(notification)
  }
}
