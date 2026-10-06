import { Module } from '@nestjs/common'
import { ClearRolePermissionsCacheSubscriber } from './clear-role-permissions-cache.subscriber.js'
import { ClearRolePermissionsCacheUseCaseModule } from './clear-role-permissions-cache.use-case.module.js'

@Module({
  imports: [ClearRolePermissionsCacheUseCaseModule],
  providers: [ClearRolePermissionsCacheSubscriber]
})
export class ClearRolePermissionsCacheSubscriberModule {}
