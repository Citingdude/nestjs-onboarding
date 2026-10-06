import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { Logger } from '@nestjs/common'
import { generateAsyncAPIHTML, generateAsyncApiYaml, type AsyncAPIDefinition } from '@wisemen/nestjs-async-api'

export const AsyncAPIDocs: AsyncAPIDefinition = {
  asyncapi: '3.0.0',
  defaultContentType: 'application/json',
  info: {
    title: 'Wisemen Node.js template project',
    version: '0.0.0'
  },
  channels: './dist/src/**/*.integration.event.js'
}

async function generateAsyncAPI (): Promise<void> {
  const yaml = await generateAsyncApiYaml(AsyncAPIDocs)
  const modulePath = 'dist/src/modules/async-api'
  writeFileSync(modulePath + '/async-api.yaml', yaml)

  try {
    const html = generateAsyncAPIHTML(yaml)
    if (!existsSync(modulePath)) {
      mkdirSync(modulePath)
    }
    writeFileSync(modulePath + '/async-api.html', html)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    Logger.warn(`Skipping async-api.html generation: ${message}`)
  }
}

generateAsyncAPI().catch(err => Logger.error(err))
