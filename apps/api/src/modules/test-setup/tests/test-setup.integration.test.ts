import { after, before, describe, it } from 'node:test'
import assert from 'node:assert'
import { Module } from '@nestjs/common'
import { readonly } from '@wisemen/nestjs-typeorm'
import { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

const testOverrideToken = Symbol('test-override-token')

@Module({
  providers: [
    {
      provide: testOverrideToken,
      useValue: 'default'
    }
  ],
  exports: [testOverrideToken]
})
class TestOverrideModule {}

describe('Test setup integration tests', () => {
  let setup: TestSetup

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
  })

  after(async () => await setup.teardown())

  it('keeps the shared transaction query runner active after readonly calls', async () => {
    const queryRunner = setup.entityManager.queryRunner

    assert(queryRunner != null)

    await readonly(setup.dataSource, async () => {
      await setup.entityManager.query('SELECT 1')
    })

    assert.equal(queryRunner.isReleased, false)

    await readonly(setup.dataSource, async () => {
      await setup.entityManager.query('SELECT 1')
    })

    assert.equal(queryRunner.isReleased, false)
  })
})

describe('Test setup cache key integration tests', () => {
  it('reuses module test apps when no provider overrides are supplied', async () => {
    const firstSetup = await TestBench.setupModuleTest(TestOverrideModule)
    await firstSetup.teardown()

    const secondSetup = await TestBench.setupModuleTest(TestOverrideModule)
    await secondSetup.teardown()

    assert.strictEqual(firstSetup.app, secondSetup.app)
  })

  it('creates a fresh module test app when provider overrides are supplied without a module key', async () => {
    const firstSetup = await TestBench.setupModuleTest(TestOverrideModule, {
      providerOverrides: [{ provider: testOverrideToken, useValue: 'first' }]
    })
    const firstValue = firstSetup.app.get<string>(testOverrideToken, { strict: false })
    await firstSetup.teardown()

    const secondSetup = await TestBench.setupModuleTest(TestOverrideModule, {
      providerOverrides: [{ provider: testOverrideToken, useValue: 'second' }]
    })
    const secondValue = secondSetup.app.get<string>(testOverrideToken, { strict: false })
    await secondSetup.teardown()

    assert.notStrictEqual(firstSetup.app, secondSetup.app)
    assert.equal(firstValue, 'first')
    assert.equal(secondValue, 'second')
  })

  it('reuses module test apps with provider overrides when an explicit module key is supplied', async () => {
    const sharedModuleKey = Symbol('shared-test-module-key')

    const firstSetup = await TestBench.setupModuleTest(TestOverrideModule, {
      moduleKey: sharedModuleKey,
      providerOverrides: [{ provider: testOverrideToken, useValue: 'shared' }]
    })
    const firstValue = firstSetup.app.get<string>(testOverrideToken, { strict: false })
    await firstSetup.teardown()

    const secondSetup = await TestBench.setupModuleTest(TestOverrideModule, {
      moduleKey: sharedModuleKey,
      providerOverrides: [{ provider: testOverrideToken, useValue: 'ignored-on-reuse' }]
    })
    const secondValue = secondSetup.app.get<string>(testOverrideToken, { strict: false })
    await secondSetup.teardown()

    assert.strictEqual(firstSetup.app, secondSetup.app)
    assert.equal(firstValue, 'shared')
    assert.equal(secondValue, 'shared')
  })
})
