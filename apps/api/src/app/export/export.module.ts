import { Module } from '@nestjs/common'
import { ViewExportIndexModule } from './use-cases/view-export-index/view-export-index.module.js'

@Module({
  imports: [
    ViewExportIndexModule
  ]
})
export class ExportModule {}
