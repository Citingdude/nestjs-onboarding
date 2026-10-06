import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, readonly } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { ViewRoleDetailResponse } from './view-role-detail.response.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import type { RoleUuid } from '#src/modules/auth/roles/entities/role.uuid.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'

@Injectable()
export class ViewRoleDetailUseCase {
  constructor (
    private readonly dataSource: DataSource,
    @InjectRepository(Role)
    private roleRepository: TypeOrmRepository<Role>
  ) {}

  async execute (uuid: RoleUuid): Promise<ViewRoleDetailResponse> {
    const role = await readonly(this.dataSource, async () =>
      await this.roleRepository.findOneBy({ uuid })
    )

    if (role === null) {
      throw new RoleNotFoundError(uuid)
    }

    return new ViewRoleDetailResponse(role)
  }
}
