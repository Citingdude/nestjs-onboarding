import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { CreateApiKeyUseCase } from './create-api-key.use-case.js'
import { CreateApiKeyController } from './create-api-key.controller.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import { AuthorizationServiceModule } from '#src/modules/auth/authorization/authorization.service.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    AuthorizationServiceModule
  ],
  controllers: [
    CreateApiKeyController
  ],
  providers: [
    CreateApiKeyUseCase
  ]
})
export class CreateApiKeyModule { }
