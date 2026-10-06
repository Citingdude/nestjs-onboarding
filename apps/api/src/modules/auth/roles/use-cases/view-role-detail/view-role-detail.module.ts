import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewRoleDetailUseCase } from './view-role-detail.use-case.js'
import { ViewRoleDetailController } from './view-role-detail.controller.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [ViewRoleDetailController],
  providers: [ViewRoleDetailUseCase]
})
export class ViewRoleDetailModule {}
