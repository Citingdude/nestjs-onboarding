import { type DynamicModule, Module, type Type } from '@nestjs/common'
import { DefaultTypeOrmModule } from './modules/typeorm/default-typeorm.module.js'
import { DefaultConfigModule } from './modules/config/default-config.module.js'
import { ExceptionFilterModule } from '#src/modules/exception-filter/exception-filter.module.js'
import { FeatureFlagModule } from '#src/modules/feature-flag/default-feature-flag.module.js'
import { GlobalPipesModule } from '#src/modules/global-pipes/global-pipes.module.js'
import { DefaultDomainEventModule } from '#src/modules/domain-events/default-domain-event.module.js'
import { DefaultOtelModule } from '#src/modules/opentelemetry/default-otel.module.js'

@Module({})
export class AppModule {
  static forRoot (
    modules: Array<DynamicModule | Promise<DynamicModule> | Type<unknown>> = []
  ): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DefaultConfigModule,
        DefaultTypeOrmModule.forRootAsync({ migrationsRun: true }),
        FeatureFlagModule,

        ExceptionFilterModule,
        GlobalPipesModule,
        DefaultOtelModule,

        DefaultDomainEventModule,

        // Utils
        ...modules
      ]
    }
  }
}
