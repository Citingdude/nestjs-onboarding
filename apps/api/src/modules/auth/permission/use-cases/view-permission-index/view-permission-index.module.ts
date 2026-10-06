import { Module } from '@nestjs/common'
import { ViewPermissionIndexController } from './view-permission-index.controller.js'

@Module({
  controllers: [ViewPermissionIndexController]
})
export class ViewPermissionIndexModule {}
