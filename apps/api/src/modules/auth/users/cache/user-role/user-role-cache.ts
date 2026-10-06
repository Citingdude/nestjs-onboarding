import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { RedisClient } from '@wisemen/nestjs-redis'
import { RedisCachePrefix } from '#src/modules/redis/redis-cache-prefix.js'
import { RedisCache } from '#src/modules/redis/redis-cache.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Injectable()
export class UserRoleCache extends RedisCache {
  readonly prefix = RedisCachePrefix.USER_ROLE

  constructor (
    private readonly client: RedisClient,
    @InjectRepository(User)
    private userRepository: TypeOrmRepository<User>
  ) {
    super()
  }

  async clearUserRoles (userUuids: UserUuid[]): Promise<void> {
    const keys = userUuids.map(userUuid => this.buildCacheKey(userUuid))

    await this.client.deleteCachedValues(keys)
  }

  async setUserRoles (userUuid: UserUuid, roleUuids: RoleUuid[]): Promise<void> {
    await this.client.putCachedValue(this.buildCacheKey(userUuid), roleUuids)
  }

  async getUserRoles (userUuid: UserUuid): Promise<RoleUuid[]> {
    const cacheKey = this.buildCacheKey(userUuid)
    const cachedRoleUuids = await this.getCachedRoles(cacheKey)

    if (cachedRoleUuids != null) {
      return cachedRoleUuids
    }

    const user = await this.userRepository.findOne({
      where: { uuid: userUuid },
      relations: { userRoles: true }
    })

    const roleUuids = user?.userRoles?.map(userRole => userRole.roleUuid) ?? []

    await this.client.putCachedValue(cacheKey, roleUuids)

    return roleUuids
  }

  private async getCachedRoles (key: string): Promise<RoleUuid[] | null> {
    return await this.client.getCachedValue(key)
  }
}
