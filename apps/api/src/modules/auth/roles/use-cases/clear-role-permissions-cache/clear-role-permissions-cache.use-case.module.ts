import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ClearRolePermissionsCacheUseCase } from './clear-role-permissions-cache.use-case.js'
import { RoleCacheModule } from '#src/modules/auth/roles/cache/role-cache.module.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Module({
  imports: [
    RoleCacheModule,
    TypeOrmModule.forFeature([Role])
  ],
  providers: [ClearRolePermissionsCacheUseCase],
  exports: [ClearRolePermissionsCacheUseCase]
})
export class ClearRolePermissionsCacheUseCaseModule {}
