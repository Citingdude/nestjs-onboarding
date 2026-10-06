import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewApiKeyIndexUseCase } from './view-api-key-index.use-case.js'
import { ViewApiKeyIndexController } from './view-api-key-index.controller.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import { PermissionsGuardModule } from '#src/modules/auth/permission/guard/permission.guard.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    PermissionsGuardModule
  ],
  controllers: [
    ViewApiKeyIndexController
  ],
  providers: [
    ViewApiKeyIndexUseCase
  ]
})
export class ViewApiKeyIndexModule { }
