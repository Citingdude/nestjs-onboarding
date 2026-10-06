import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Any } from 'typeorm'
import { RedisClient } from '@wisemen/nestjs-redis'
import { RedisCache } from '#src/modules/redis/redis-cache.js'
import { RedisCachePrefix } from '#src/modules/redis/redis-cache-prefix.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Injectable()
export class RoleCache extends RedisCache {
  readonly prefix = RedisCachePrefix.ROLE

  constructor (
    private client: RedisClient,
    @InjectRepository(Role)
    private roleRepository: TypeOrmRepository<Role>
  ) {
    super()
  }

  async clearRolesPermissions (roleUuids: RoleUuid[]): Promise<void> {
    const keys = roleUuids.map(roleUuid => this.buildCacheKey(roleUuid))

    await this.client.deleteCachedValues(keys)
  }

  async getRolesPermissions (roleUuids: RoleUuid[]): Promise<Permission[]> {
    if (roleUuids.length == 0) return []

    const permissions: Permission[] = []
    const missingRoleUuids: RoleUuid[] = []

    const cacheKeys = roleUuids.map(roleUuid => this.buildCacheKey(roleUuid))
    const cachedEntries = await this.getCachedPermissions(cacheKeys)

    for (const [index, cachedPermissions] of cachedEntries.entries()) {
      if (cachedPermissions != null) {
        permissions.push(...cachedPermissions)
      } else {
        missingRoleUuids.push(roleUuids[index])
      }
    }

    if (missingRoleUuids.length > 0) {
      const missingPermissions = await this.getMissingPermissions(missingRoleUuids)

      permissions.push(...missingPermissions)
    }

    return permissions
  }

  private async getMissingPermissions (uuids: RoleUuid[]): Promise<Permission[]> {
    const roles = await this.roleRepository.findBy({ uuid: Any(uuids) })

    if (roles.length === 0) {
      return []
    }

    const newPermissions = roles.map(role => role.permissions)
    const newKeys = roles.map(role => this.buildCacheKey(role.uuid))

    await this.client.putCachedValues(newKeys, newPermissions)

    return roles.flatMap(role => role.permissions)
  }

  private async getCachedPermissions (keys: string[]): Promise<(Permission[] | null)[]> {
    return await this.client.getCachedValues<Permission[]>(keys)
  }
}
