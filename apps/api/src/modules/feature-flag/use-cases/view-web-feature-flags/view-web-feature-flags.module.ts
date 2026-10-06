import { Module } from '@nestjs/common'
import { ViewWebFeatureFlagsController } from './view-web-feature-flags.controller.js'
import { ViewWebFeatureFlagsUseCase } from './view-web-feature-flags.use-case.js'

@Module({
  controllers: [ViewWebFeatureFlagsController],
  providers: [ViewWebFeatureFlagsUseCase]
})
export class ViewWebFeatureFlagsModule {}
