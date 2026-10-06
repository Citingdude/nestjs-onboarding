import { Injectable } from '@nestjs/common'
import { InjectRepository, readonly, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { DataSource, IsNull } from 'typeorm'
import { GetMyNotificationsQuery } from './query/get-my-notifications.query.js'
import { GetMyNotificationsResponse } from './get-my-notifications.response.js'
import { TYPESENSE_DEFAULT_LIMIT } from '#src/modules/typesense/typesense.constant.js'
import { UserNotification } from '#src/modules/notification/entities/user-notification.entity.js'
import { LocalizationContext } from '#src/modules/localization/localization-context.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@Injectable()
export class GetMyNotificationsUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(UserNotification)
    private readonly repo: TypeOrmRepository<UserNotification>,
    private readonly authContext: AuthContext,
    private readonly localizationContext: LocalizationContext
  ) {}

  async getNotifications (
    query: GetMyNotificationsQuery
  ): Promise<GetMyNotificationsResponse> {
    const userUuid = this.authContext.getUserUuidOrFail()
    const batchSize = query.pagination?.limit ?? TYPESENSE_DEFAULT_LIMIT
    const lastEntity = query.pagination?.key != null
      ? {
          notificationUuid: query.pagination.key.notificationUuid,
          createdAt: new Date(query.pagination.key.createdAt),
          userUuid
        }
      : undefined

    const userNotifications = await readonly(this.dataSource, async () =>
      await this.repo.findNextBatch({
        where: {
          userUuid,
          readAt: query.filter?.onlyUnread === 'true' ? IsNull() : undefined
        },
        order: {
          createdAt: 'DESC',
          notificationUuid: 'DESC'
        },
        relations: {
          notification: { createdByUser: true }
        }
      }, batchSize, lastEntity)
    )

    return new GetMyNotificationsResponse(userNotifications)
  }
}
