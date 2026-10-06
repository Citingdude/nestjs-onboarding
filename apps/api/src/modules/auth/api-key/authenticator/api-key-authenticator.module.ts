import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ApiKeyAuthCacheModule } from '#src/modules/auth/api-key/authenticator/cache/api-key-auth-cache.module.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import { ApiKeyAuthenticator } from '#src/modules/auth/api-key/authenticator/api-key-authenticator.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    ApiKeyAuthCacheModule
  ],
  providers: [ApiKeyAuthenticator],
  exports: [ApiKeyAuthenticator]
})
export class ApiKeyAuthenticatorModule {}
