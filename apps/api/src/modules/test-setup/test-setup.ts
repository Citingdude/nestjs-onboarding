import type { Server } from 'http'
import assert from 'node:assert'
import type { TestingModule } from '@nestjs/testing'
import type { DataSource, EntityManager, QueryRunner, ReplicationMode } from 'typeorm'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FeatureFlags, FeatureFlagsStub } from '@wisemen/nestjs-feature-flags'
import Sinon, { type SinonStub } from 'sinon'
import type { TestApp } from './test-bench.js'
import type { TestAuthContext } from '#src/modules/test-setup/test-auth-context.js'

export class TestSetup {
  static async create (app: TestApp): Promise<TestSetup> {
    const setup = new TestSetup(
      app.app,
      app.testModule,
      app.dataSource,
      app.authContext
    )

    await setup.initialize()

    return setup
  }

  private flagsStub: FeatureFlagsStub
  private createQueryRunnerStub: SinonStub<[mode?: ReplicationMode | undefined], QueryRunner>
  private releaseQueryRunnerStub: SinonStub<[], Promise<void>>

  private constructor (
    readonly app: NestFastifyApplication,
    readonly testModule: TestingModule,
    readonly dataSource: DataSource,
    readonly authContext: TestAuthContext
  ) {}

  private async initialize (): Promise<void> {
    const queryRunner = this.dataSource.manager.queryRunner

    assert(queryRunner != null, 'Expected a shared query runner in test setup')

    await queryRunner.startTransaction()

    this.createQueryRunnerStub = Sinon.stub(this.dataSource, 'createQueryRunner')
      .callsFake(() => queryRunner)
    this.releaseQueryRunnerStub = Sinon.stub(queryRunner, 'release').resolves()

    const flags = this.app.get(FeatureFlags, { strict: false })
    this.flagsStub = new FeatureFlagsStub(flags)
  }

  public async teardown (): Promise<void> {
    const queryRunner = this.dataSource.manager.queryRunner
    this.flagsStub.reset()

    try {
      await queryRunner?.rollbackTransaction()
    } finally {
      this.releaseQueryRunnerStub.restore()
      this.createQueryRunnerStub.restore()
    }
  }

  get httpServer (): Server {
    return this.app.getHttpServer()
  }

  get flags (): FeatureFlagsStub {
    return this.flagsStub
  }

  get entityManager (): EntityManager {
    return this.dataSource.manager
  }
}
