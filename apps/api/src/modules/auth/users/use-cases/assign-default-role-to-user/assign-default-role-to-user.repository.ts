import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'

export class AssignDefaultRoleToUserRepository {
  constructor (
    @InjectRepository(Role) private readonly roleRepository: TypeOrmRepository<Role>,
    @InjectRepository(UserRole) private readonly userRoleRepository: TypeOrmRepository<UserRole>
  ) {}

  async getDefaultRole (): Promise<Role | null> {
    return await this.roleRepository.findOneBy({ isDefault: true })
  }

  async insert (userRoles: UserRole[]): Promise<void> {
    await this.userRoleRepository.insert(userRoles)
  }
}
