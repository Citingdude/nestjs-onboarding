import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { PermissionsGuard } from '#src/modules/auth/permission/guard/permission.guard.js'
import { AuthContextModule } from '#src/modules/auth/context/auth.context.module.js'

@Module({
  imports: [AuthContextModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard
    }
  ]
})
export class PermissionsGuardModule {}
