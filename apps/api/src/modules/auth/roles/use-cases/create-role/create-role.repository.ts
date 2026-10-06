import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Injectable()
export class CreateRoleRepository {
  constructor (
    @InjectRepository(Role) private roleRepository: TypeOrmRepository<Role>
  ) {}

  async isNameAlreadyInUse (name: string): Promise<boolean> {
    return await this.roleRepository.existsBy({ name })
  }

  async insert (role: Role): Promise<void> {
    await this.roleRepository.insert(role)
  }
}
