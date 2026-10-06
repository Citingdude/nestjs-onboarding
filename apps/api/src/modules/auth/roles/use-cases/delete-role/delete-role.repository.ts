import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'

export class DeleteRoleRepository {
  constructor (
    @InjectRepository(Role) private roleRepository: TypeOrmRepository<Role>,
    @InjectRepository(UserRole) private userRoleRepository: TypeOrmRepository<UserRole>
  ) {}

  async findRole (withUuid: RoleUuid): Promise<Role | null> {
    return await this.roleRepository.findOneBy({ uuid: withUuid })
  }

  async delete (role: Role): Promise<void> {
    await this.userRoleRepository.delete({ roleUuid: role.uuid })
    await this.roleRepository.delete({ uuid: role.uuid })
  }
}
