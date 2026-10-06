import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { UpdateRoleController } from './update-role.controller.js'
import { UpdateRoleUseCase } from './update-role.use-case.js'
import { UpdateRoleRepository } from './update-role.repository.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Role])
  ],
  controllers: [UpdateRoleController],
  providers: [UpdateRoleUseCase, UpdateRoleRepository]
})
export class UpdateRoleModule {}
