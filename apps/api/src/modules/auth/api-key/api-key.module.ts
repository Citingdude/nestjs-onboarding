import { Module } from '@nestjs/common'
import { CreateApiKeyModule } from './use-cases/create-api-key/create-api-key.module.js'
import { DeleteApiKeyModule } from './use-cases/delete-api-key/delete-api-key.module.js'
import { ViewApiKeyIndexModule } from './use-cases/view-api-key-index/view-api-key-index.module.js'

@Module({
  imports: [
    CreateApiKeyModule,
    DeleteApiKeyModule,
    ViewApiKeyIndexModule
  ]
})
export class ApiKeyModule { }
