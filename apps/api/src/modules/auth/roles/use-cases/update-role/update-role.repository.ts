import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Not } from 'typeorm'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class UpdateRoleRepository {
  constructor (
    @InjectRepository(Role) private roleRepository: TypeOrmRepository<Role>
  ) {}

  async findRole (withUuid: RoleUuid): Promise<Role | null> {
    return await this.roleRepository.findOneBy({ uuid: withUuid })
  }

  async isNameAlreadyInUse (name: string, excludedRole: Role): Promise<boolean> {
    return await this.roleRepository.existsBy({ name, uuid: Not(excludedRole.uuid) })
  }

  async updateName (role: Role): Promise<void> {
    await this.roleRepository.update(
      { uuid: role.uuid },
      { name: role.name }
    )
  }
}
