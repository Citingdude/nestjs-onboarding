import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Any } from 'typeorm'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

@Injectable()
export class UpdateRolesPermissionsRepository {
  constructor (
    @InjectRepository(Role) private readonly roleRepository: TypeOrmRepository<Role>
  ) {}

  async findRoles (uuids: RoleUuid[]): Promise<Role[]> {
    return await this.roleRepository.findBy({ uuid: Any(uuids) })
  }

  async updateRoles (roles: Role[]): Promise<void> {
    await this.roleRepository.upsert(roles, { conflictPaths: { uuid: true } })
  }
}
