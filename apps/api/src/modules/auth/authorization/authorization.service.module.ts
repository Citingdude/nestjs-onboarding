import { Module } from '@nestjs/common'
import { AuthorizationService } from '#src/modules/auth/authorization/authorization.service.js'
import { RoleCacheModule } from '#src/modules/auth/roles/cache/role-cache.module.js'
import { UserRoleCacheModule } from '#src/modules/auth/users/cache/user-role/user-role-cache.module.js'

@Module({
  imports: [
    RoleCacheModule,
    UserRoleCacheModule
  ],
  providers: [AuthorizationService],
  exports: [AuthorizationService]
})
export class AuthorizationServiceModule {}
