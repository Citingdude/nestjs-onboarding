import { Module } from '@nestjs/common'
import { ViewPermissionIndexModule } from './use-cases/view-permission-index/view-permission-index.module.js'

@Module({
  imports: [ViewPermissionIndexModule]
})
export class PermissionHttpModule {}
