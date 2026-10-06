import { join } from 'node:path'
import { Global, Module } from '@nestjs/common'
import { EvaluationType, FeatureFlagModule as FlagModule, type FeatureFlagModuleOptions } from '@wisemen/nestjs-feature-flags'
import { ConfigService } from '@nestjs/config'
import { SyncFeatureFlagConfigModule } from '#src/modules/feature-flag/use-cases/sync-feature-flag-config/sync-feature-flag-config.module.js'
import { ViewWebFeatureFlagsModule } from '#src/modules/feature-flag/use-cases/view-web-feature-flags/view-web-feature-flags.module.js'

@Global()
@Module({
  imports: [
    SyncFeatureFlagConfigModule,
    ViewWebFeatureFlagsModule,
    FlagModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): FeatureFlagModuleOptions => {
        const endpoint = cfg.get<string>('GO_FEATURE_FLAG_URI')?.trim()
        const flagsGlob = join(process.cwd(), 'dist', '**', '*.flag.js')

        if (endpoint === undefined) {
          return { flagsGlob }
        }

        const apiKey = cfg.get<string>('GO_FEATURE_FLAG_API_KEY')?.trim()

        return {
          flagsGlob,
          defaultProvider: {
            apiKey,
            endpoint,
            evaluationType: EvaluationType.InProcess,
            flagChangePollingIntervalMs: 30_000 // ms
          }
        }
      }
    })
  ],
  exports: [FlagModule]
})
export class FeatureFlagModule { }
