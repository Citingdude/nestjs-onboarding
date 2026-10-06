import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewExportIndexUseCase } from './view-export-index.use-case.js'
import { ViewExportIndexController } from './view-export-index.controller.js'
import { Export } from '#src/app/export/entities/export.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([Export])
  ],
  controllers: [
    ViewExportIndexController
  ],
  providers: [
    ViewExportIndexUseCase
  ]
})
export class ViewExportIndexModule {}
