import { Injectable } from '@nestjs/common'
import { Subscribe } from '@wisemen/nestjs-domain-events'

import { UserRolesSetEvent } from '#src/modules/auth/users/use-cases/set-user-roles/user-roles-set.event.js'
import { UserRoleCache } from '#src/modules/auth/users/cache/user-role/user-role-cache.js'

@Injectable()
export class ClearUserRoleCacheSubscriber {
  constructor (
    private readonly userRoleCache: UserRoleCache
  ) {}

  @Subscribe(UserRolesSetEvent)
  async onEvents (events: Array<UserRolesSetEvent>): Promise<void> {
    const userUuids = events.map(event => event.content.userUuid)
    await this.userRoleCache.clearUserRoles(userUuids)
  }
}
