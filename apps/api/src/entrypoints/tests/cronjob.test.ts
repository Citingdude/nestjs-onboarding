import { describe, it } from 'node:test'
import { Test } from '@nestjs/testing'
import { expect } from 'expect'
import { AppModule } from '#src/app.module.js'
import { CronjobFactory } from '#src/entrypoints/cronjob.factory.js'
import { CronjobType } from '#src/entrypoints/cronjob.type.js'

describe('Cronjob tests', () => {
  async function testCronjobStartup (argv: string[]): Promise<void> {
    const cronjobModule = await CronjobFactory.create(argv)
    const appModule = AppModule.forRoot([cronjobModule])
    const cronjob = await Test.createTestingModule({ imports: [appModule] }).compile()
    return cronjob.close()
  }

  const cronjobs = Object.values(CronjobType)
    .filter(type => type !== CronjobType.ARCHIVE_DOMAIN_EVENT_LOGS)

  for (const type of cronjobs) {
    it(`Cronjob ${type as string} starts successfully`, async () => {
      await expect(testCronjobStartup([type])).resolves.not.toThrow()
    })
  }

  it(`Cronjob ${CronjobType.ARCHIVE_DOMAIN_EVENT_LOGS} starts successfully`, async () => {
    const promise = testCronjobStartup([CronjobType.ARCHIVE_DOMAIN_EVENT_LOGS, '--max-range=1h'])
    await expect(promise).resolves.not.toThrow()
  })
})
