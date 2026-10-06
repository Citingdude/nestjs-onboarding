import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { RolePermissionsCacheClearedEvent } from './role-permissions-cache-cleared.event.js'
import { RoleCache } from '#src/modules/auth/roles/cache/role-cache.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

@Injectable()
export class ClearRolePermissionsCacheUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly roleCache: RoleCache,
    @InjectRepository(Role) private readonly roleRepository: TypeOrmRepository<Role>
  ) {}

  async execute (roleUuids?: RoleUuid[]): Promise<void> {
    if (roleUuids === undefined) {
      const roles = await this.roleRepository.find({ select: { uuid: true } })
      roleUuids = roles.map(role => role.uuid)
    }

    await this.roleCache.clearRolesPermissions(roleUuids)

    await transaction(this.dataSource, async () => {
      await this.eventEmitter.emitOne(new RolePermissionsCacheClearedEvent(roleUuids))
    })
  }
}
