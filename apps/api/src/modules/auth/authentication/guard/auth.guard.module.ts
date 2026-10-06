import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { AuthContextModule } from '#src/modules/auth/context/auth.context.module.js'
import { AuthGuard } from '#src/modules/auth/authentication/guard/auth.guard.js'

@Module({
  imports: [AuthContextModule],
  providers: [{
    provide: APP_GUARD,
    useClass: AuthGuard
  }]
})
export class AuthGuardModule {}
