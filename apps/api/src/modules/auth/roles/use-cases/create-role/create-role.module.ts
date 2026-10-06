import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { CreateRoleUseCase } from './create-role.use-case.js'
import { CreateRoleController } from './create-role.controller.js'
import { CreateRoleRepository } from './create-role.repository.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Role])
  ],
  controllers: [CreateRoleController],
  providers: [
    CreateRoleUseCase,
    CreateRoleRepository
  ]
})
export class CreateRoleModule {}
