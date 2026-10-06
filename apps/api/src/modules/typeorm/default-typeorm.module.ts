import { type DynamicModule, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FeatureFlagEntity } from '@wisemen/nestjs-feature-flags'
import { SnakeNamingStrategy, sslHelper, TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { customPostgresDataTypes } from './custom-data-types.js'

@Module({})
export class DefaultTypeOrmModule {
  static forRootAsync (
    options: {
      migrationsRun?: boolean
    }
  ): DynamicModule {
    const migrationsRun = options.migrationsRun ?? false

    return TypeOrmModule.forRootAsync({
      customDataTypes: [...customPostgresDataTypes],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: Number(configService.getOrThrow('DB_PORT')),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_NAME'),
        ssl: sslHelper(configService.getOrThrow('DB_SSL')),
        extra: { max: 50 },
        logging: false,
        synchronize: false,
        migrations: migrationsRun ? ['dist/src/sql/migrations/**/*.js'] : [],
        migrationsRun,
        entities: ['dist/src/**/*.entity.js', FeatureFlagEntity],
        namingStrategy: new SnakeNamingStrategy(),
        invalidWhereValuesBehavior: {
          null: 'throw',
          undefined: 'ignore'
        }
      }),
      inject: [ConfigService]
    })
  }
}
