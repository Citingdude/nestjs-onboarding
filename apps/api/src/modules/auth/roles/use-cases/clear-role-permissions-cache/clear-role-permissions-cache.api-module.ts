import { Module } from '@nestjs/common'
import { ClearRolePermissionsCacheUseCaseModule } from './clear-role-permissions-cache.use-case.module.js'
import { ClearRolePermissionsCacheController } from './clear-role-permissions-cache.controller.js'

@Module({
  imports: [ClearRolePermissionsCacheUseCaseModule],
  controllers: [ClearRolePermissionsCacheController]
})
export class ClearRolePermissionsCacheApiModule {}
