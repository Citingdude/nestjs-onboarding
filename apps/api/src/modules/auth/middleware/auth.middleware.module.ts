import { Module } from '@nestjs/common'
import { AuthMiddleware } from '#src/modules/auth/middleware/auth.middleware.js'
import { AuthenticatorModule } from '#src/modules/auth/authentication/authenticator/authenticator.module.js'
import { AuthContextModule } from '#src/modules/auth/context/auth.context.module.js'
import { FeatureFlagModule } from '#src/modules/feature-flag/default-feature-flag.module.js'
import { DefaultApiThrottlerModule } from '#src/modules/throttler/default-api-throttler.module.js'

@Module({
  imports: [
    AuthenticatorModule,
    AuthContextModule,
    FeatureFlagModule,
    DefaultApiThrottlerModule
  ],
  providers: [AuthMiddleware],
  exports: [AuthMiddleware]
})
export class AuthMiddlewareModule {}
