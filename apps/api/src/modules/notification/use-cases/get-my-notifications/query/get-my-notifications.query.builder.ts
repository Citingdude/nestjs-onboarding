import type { GetMyNotificationsQueryKey } from './get-my-notifications.query.key.js'
import { GetMyNotificationsPaginationQuery, GetMyNotificationsQuery } from './get-my-notifications.query.js'
import { GetMyNotificationsFilterQuery } from './get-my-notifications.filter.query.js'

export class GetMyNotificationsQueryBuilder {
  private readonly query: GetMyNotificationsQuery
  constructor () {
    this.query = new GetMyNotificationsQuery()
  }

  withOnlyUnread (onlyUnread: boolean): this {
    this.query.filter ??= new GetMyNotificationsFilterQuery()
    this.query.filter.onlyUnread = String(onlyUnread)
    return this
  }

  withLimit (limit: number): this {
    this.query.pagination ??= new GetMyNotificationsPaginationQuery()
    this.query.pagination.limit = limit
    return this
  }

  withKey (key: GetMyNotificationsQueryKey): this {
    this.query.pagination ??= new GetMyNotificationsPaginationQuery()
    this.query.pagination.key = key
    return this
  }

  build (): GetMyNotificationsQuery {
    return this.query
  }
}
