import { describe, it } from 'node:test'
import { Test } from '@nestjs/testing'
import { expect } from 'expect'
import { OpentelemetryMetricsModule } from '#src/modules/opentelemetry/opentelemetry-metrics.module.js'

describe('Opentelemetry metrics module tests', () => {
  async function testMetricsStartup (): Promise<void> {
    const module = await Test.createTestingModule({
      imports: [OpentelemetryMetricsModule]
    }).compile()

    return module.close()
  }

  it(`Metrics module starts successfully`, async () => {
    await expect(testMetricsStartup()).resolves.not.toThrow()
  })
})
