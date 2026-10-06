import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import { ViewUnreadNotificationsCountResponse } from './view-unread-notifications-count.response.js'
import { MAX_UNREAD_NOTIFICATIONS_COUNT } from './constants.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'

@Injectable()
export class ViewUnreadNotificationsCountUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly authContext: AuthContext,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepo: TypeOrmRepository<UserNotification>
  ) {}

  async execute (): Promise<ViewUnreadNotificationsCountResponse> {
    const userUuid = this.authContext.getUserUuidOrFail()

    const { amount: rawAmount } = await readonly(this.dataSource, async () =>
      await this.userNotificationRepo.createQueryBuilder('notification')
        .select('COUNT(*) AS "amount"')
        .where('notification.userUuid = :userUuid', { userUuid })
        .andWhere('notification.channel = :channel', { channel: NotificationChannel.APP })
        .andWhere('notification.readAt IS NULL')
        .limit(MAX_UNREAD_NOTIFICATIONS_COUNT + 1)
        .getRawOne<{ amount: string }>()
    ) ?? { amount: 0 }

    const exceedsLimit = Number(rawAmount) > MAX_UNREAD_NOTIFICATIONS_COUNT
    const amount = exceedsLimit ? MAX_UNREAD_NOTIFICATIONS_COUNT : Number(rawAmount)

    return new ViewUnreadNotificationsCountResponse(amount, exceedsLimit)
  }
}
