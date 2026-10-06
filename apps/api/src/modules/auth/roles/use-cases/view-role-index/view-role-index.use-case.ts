import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { ViewRoleIndexResponse } from './view-role-index.response.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Injectable()
export class ViewRoleIndexUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(Role)
    private roleRepository: TypeOrmRepository<Role>
  ) {}

  async execute (): Promise<ViewRoleIndexResponse> {
    const roles = await readonly(this.dataSource, async () =>
      await this.roleRepository.find()
    )

    return new ViewRoleIndexResponse(roles)
  }
}
