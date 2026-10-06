import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import type { RawServerDefault } from 'fastify'
import { GenerateTranslationsModule } from '#src/modules/localization/modules/generate-translations.module.js'

async function translate (): Promise<void> {
  const adapter = new FastifyAdapter<RawServerDefault>({})
  const app = await NestFactory.create(GenerateTranslationsModule, adapter)
  await app.init()
  Logger.log('Finished translating')
  await app.close()
}

translate().catch(err => Logger.error(err))
