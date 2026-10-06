import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { DeleteRoleController } from './delete-role.controller.js'
import { DeleteRoleUseCase } from './delete-role.use-case.js'
import { DeleteRoleRepository } from './delete-role.repository.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, UserRole])
  ],
  controllers: [DeleteRoleController],
  providers: [DeleteRoleUseCase, DeleteRoleRepository]
})
export class DeleteRoleModule {}
