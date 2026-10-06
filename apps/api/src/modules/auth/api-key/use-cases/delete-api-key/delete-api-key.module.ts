import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { DeleteApiKeyUseCase } from './delete-api-key.use-case.js'
import { DeleteApiKeyController } from './delete-api-key.controller.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import { PermissionsGuardModule } from '#src/modules/auth/permission/guard/permission.guard.module.js'
import { ApiKeyAuthCacheModule } from '#src/modules/auth/api-key/authenticator/cache/api-key-auth-cache.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    PermissionsGuardModule,
    ApiKeyAuthCacheModule
  ],
  controllers: [
    DeleteApiKeyController
  ],
  providers: [
    DeleteApiKeyUseCase
  ]
})
export class DeleteApiKeyModule { }
