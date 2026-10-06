import '#src/modules/opentelemetry/instrumentation.js'
import type { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { hideBin } from 'yargs/helpers'
import { JobContainer } from '@wisemen/app-container/fastify'
import { CronjobFactory } from './cronjob.factory.js'
import { AppModule } from '#src/app.module.js'

export class Cronjob extends JobContainer {
  async bootstrap (): Promise<INestApplicationContext> {
    const cronjobModule = await CronjobFactory.create(hideBin(process.argv))
    return await NestFactory.createApplicationContext(AppModule.forRoot([cronjobModule]))
  }

  async execute (): Promise<void> {}
}

const _cronjob = new Cronjob()
