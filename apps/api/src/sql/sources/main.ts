import { DataSource } from 'typeorm'
import { SnakeNamingStrategy, sslHelper } from '@wisemen/nestjs-typeorm'
import { FeatureFlagEntity } from '@wisemen/nestjs-feature-flags'
import { registerCustomPostgresDataTypes } from '#src/modules/typeorm/custom-data-types.js'

export const mainDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: sslHelper(process.env.DB_SSL),
  extra: { max: 50 },
  logging: false,
  synchronize: false,
  migrationsRun: false,
  entities: ['dist/**/*.entity.js', FeatureFlagEntity],
  migrations: ['dist/src/sql/migrations/**/*.js'],
  namingStrategy: new SnakeNamingStrategy(),
  invalidWhereValuesBehavior: {
    null: 'throw',
    undefined: 'ignore'
  }
})

registerCustomPostgresDataTypes(mainDataSource)
