import { Global, Module } from '@nestjs/common'
import { FeatureFlagModule } from '#src/modules/feature-flag/default-feature-flag.module.js'
import { DefaultApiThrottlerModule } from '#src/modules/throttler/default-api-throttler.module.js'
import { PermissionHttpModule } from '#src/modules/auth/permission/permission.http.module.js'
import { UserAuthenticatorModule } from '#src/modules/auth/users/authenticator/user-authenticator.module.js'
import { ApiKeyAuthenticatorModule } from '#src/modules/auth/api-key/authenticator/api-key-authenticator.module.js'
import { PermissionsGuardModule } from '#src/modules/auth/permission/guard/permission.guard.module.js'
import { AuthMiddlewareModule } from '#src/modules/auth/middleware/auth.middleware.module.js'
import { AuthGuardModule } from '#src/modules/auth/authentication/guard/auth.guard.module.js'

@Global()
@Module({
  imports: [
    AuthMiddlewareModule,

    AuthGuardModule,
    PermissionsGuardModule,

    UserAuthenticatorModule,
    ApiKeyAuthenticatorModule,
    PermissionHttpModule,
    FeatureFlagModule,
    DefaultApiThrottlerModule
  ]
})

export class AuthModule { }
