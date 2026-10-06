import { type INestApplicationContext, Module } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { JobContainer } from '@wisemen/app-container/fastify'
import { Trace } from '@wisemen/opentelemetry'
import { ExceptionFilterModule } from '#src/modules/exception-filter/exception-filter.module.js'
import { DefaultConfigModule } from '#src/modules/config/default-config.module.js'
import { DefaultTypeOrmModule } from '#src/modules/typeorm/default-typeorm.module.js'

@Module({
  imports: [
    DefaultConfigModule,
    DefaultTypeOrmModule.forRootAsync({ migrationsRun: false }),
    ExceptionFilterModule
  ]
})
class PlayGroundModule {

}

export class Playground extends JobContainer {
  async bootstrap (): Promise<INestApplicationContext> {
    return await NestFactory.createApplicationContext(PlayGroundModule)
  }

  @Trace()
  async execute (_app: INestApplicationContext): Promise<void> {

  }
}

const _playground = new Playground()
