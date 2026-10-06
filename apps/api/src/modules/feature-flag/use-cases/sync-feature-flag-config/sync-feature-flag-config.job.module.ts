import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { FeatureFlagEntity } from '@wisemen/nestjs-feature-flags'
import { SyncFeatureFlagConfigJobHandler } from './sync-feature-flag-config.handler.js'
import { SyncFeatureFlagConfigUseCase } from './sync-feature-flag-config.use-case.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureFlagEntity])
  ],
  providers: [
    SyncFeatureFlagConfigJobHandler,
    SyncFeatureFlagConfigUseCase
  ]
})
export class SyncFeatureFlagConfigJobModule {}
