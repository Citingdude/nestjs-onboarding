import { Module } from '@nestjs/common'
import { ApiKeyAuthenticatorModule } from '#src/modules/auth/api-key/authenticator/api-key-authenticator.module.js'
import { Authenticator } from '#src/modules/auth/authentication/authenticator/authenticator.js'
import { UserAuthenticatorModule } from '#src/modules/auth/users/authenticator/user-authenticator.module.js'

@Module({
  imports: [
    ApiKeyAuthenticatorModule,
    UserAuthenticatorModule
  ],
  providers: [Authenticator],
  exports: [Authenticator]
})
export class AuthenticatorModule {}
