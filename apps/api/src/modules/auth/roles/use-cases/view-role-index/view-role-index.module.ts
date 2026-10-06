import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewRoleIndexUseCase } from './view-role-index.use-case.js'
import { ViewRoleIndexController } from './view-role-index.controller.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [ViewRoleIndexController],
  providers: [ViewRoleIndexUseCase]
})
export class ViewRoleIndexModule {}
