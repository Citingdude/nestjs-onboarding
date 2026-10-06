import { Module } from '@nestjs/common'
import { CreateRoleModule } from './use-cases/create-role/create-role.module.js'
import { DeleteRoleModule } from './use-cases/delete-role/delete-role.module.js'
import { UpdateRoleModule } from './use-cases/update-role/update-role.module.js'
import { ViewRoleDetailModule } from './use-cases/view-role-detail/view-role-detail.module.js'
import { ViewRoleIndexModule } from './use-cases/view-role-index/view-role-index.module.js'
import { UpdateRolesPermissionsModule } from './use-cases/update-roles-permissions/update-roles-permissions.module.js'
import { ClearRolePermissionsCacheSubscriberModule } from './use-cases/clear-role-permissions-cache/clear-role-permissions-cache-subscriber.module.js'
import { ClearRolePermissionsCacheApiModule } from './use-cases/clear-role-permissions-cache/clear-role-permissions-cache.api-module.js'

@Module({
  imports: [
    CreateRoleModule,
    ClearRolePermissionsCacheApiModule,
    DeleteRoleModule,
    UpdateRoleModule,
    ViewRoleDetailModule,
    ViewRoleIndexModule,
    UpdateRolesPermissionsModule,
    ClearRolePermissionsCacheSubscriberModule
  ]
})
export class RoleModule {}
