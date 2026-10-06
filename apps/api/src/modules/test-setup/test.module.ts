import { type DynamicModule, type Type, type MiddlewareConsumer, Module } from '@nestjs/common'
import { FeatureFlagModule } from '@wisemen/nestjs-feature-flags'
import { DefaultNatsClientModule } from '#src/modules/nats/nats.client.module.js'
import { AuthModule } from '#src/modules/auth/auth.module.js'
import { AuthMiddleware } from '#src/modules/auth/middleware/auth.middleware.js'
import { DefaultConfigModule } from '#src/modules/config/default-config.module.js'
import { ExceptionFilterModule } from '#src/modules/exception-filter/exception-filter.module.js'
import { RoleModule } from '#src/modules/auth/roles/role.module.js'
import { DefaultTypeOrmModule } from '#src/modules/typeorm/default-typeorm.module.js'
import { UserModule } from '#src/modules/auth/users/user.module.js'
import { DefaultDomainEventModule } from '#src/modules/domain-events/default-domain-event.module.js'

@Module({})
export class TestModule {
  static forRoot (
    modules: Array<DynamicModule | Type<unknown>> = [],
    migrationsRun = false
  ): DynamicModule {
    return {
      module: TestModule,
      imports: [
        DefaultConfigModule,
        DefaultTypeOrmModule.forRootAsync({ migrationsRun }),
        FeatureFlagModule,

        ExceptionFilterModule,

        DefaultNatsClientModule,
        DefaultDomainEventModule,

        AuthModule,
        UserModule,
        RoleModule,

        // Utils
        ...modules
      ]
    }
  }

  configure (consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('*')
  }
}
