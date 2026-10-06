import { describe, it } from 'node:test'
import { Test } from '@nestjs/testing'
import { expect } from 'expect'
import { NatsAppModule } from '#src/modules/nats/nats-app.module.js'

describe('Nats app tests', () => {
  async function testNatsAppStartup (): Promise<void> {
    const module = await Test.createTestingModule({
      imports: [NatsAppModule]
    }).compile()

    return module.close()
  }

  it(`Nats app starts successfully`, async () => {
    await expect(testNatsAppStartup()).resolves.not.toThrow()
  })
})
