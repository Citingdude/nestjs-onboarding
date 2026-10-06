import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtVerifierModule } from '@wisemen/nestjs-jwt-verifier'
import { parseEnvList } from '@wisemen/nestjs-common'
import { UserAuthenticator } from './user-authenticator.js'
import { GetOrCreateUserModule } from '#src/modules/auth/users/use-cases/get-or-create-user/get-or-create-user.module.js'
import { AuthenticatedUserCacheModule } from '#src/modules/auth/users/authenticator/authenticated-user-cache.module.js'

@Module({
  imports: [
    AuthenticatedUserCacheModule,
    GetOrCreateUserModule,
    JwtVerifierModule.forRootAsync({
      name: 'workspace',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        issuer: config.getOrThrow<string>('AUTH_ISSUER'),
        audiences: parseEnvList(config.getOrThrow<string>('AUTH_PROJECT_ID')),
        jwksEndpoint: config.getOrThrow<string>('AUTH_JWKS_ENDPOINT')
      })
    })
  ],
  providers: [UserAuthenticator],
  exports: [UserAuthenticator]
})
export class UserAuthenticatorModule {}
