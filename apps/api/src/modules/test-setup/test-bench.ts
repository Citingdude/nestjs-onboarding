import { after, afterEach, mock } from 'node:test'
import process from 'node:process'
import type { TestingModule } from '@nestjs/testing'
import { Test } from '@nestjs/testing'
import type { EntityManager } from 'typeorm'
import { DataSource } from 'typeorm'
import { expect } from 'expect'
import type { Abstract, DynamicModule, Type } from '@nestjs/common'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import qs from 'qs'
import { restore } from 'sinon'
import { isEnumValue, ISO8601, toHaveEmitted, toHaveErrorCode, toHaveStatus, toHaveValidationErrors, uuid } from '@wisemen/nestjs-tests'
import { toHaveApiError } from '@wisemen/api-error'
import { TestApiThrottlerModule } from '@wisemen/nestjs-throttler'
import { TestSetup } from './test-setup.js'
import { AppModule } from '#src/app.module.js'
import { UserAuthenticator } from '#src/modules/auth/users/authenticator/user-authenticator.js'
import { ApiModule } from '#src/modules/api/api.module.js'
import { applyHttpConventions } from '#src/modules/api/http-conventions.js'
import { DefaultApiThrottlerModule } from '#src/modules/throttler/default-api-throttler.module.js'
import type { AuthenticatedUser } from '#src/modules/auth/authentication/auth-principal.type.js'
import { TestAuthContext } from '#src/modules/test-setup/test-auth-context.js'

after(async () => await TestBench.tearDown())

export interface TestApp {
  app: NestFastifyApplication
  testModule: TestingModule
  dataSource: DataSource
  authContext: TestAuthContext
}

type ModuleCacheKey = object | string | symbol

/**
 * Overrides a provider before the Nest testing module is compiled.
 *
 * When overrides are supplied without an explicit {@link TestSetupOptions.moduleKey},
 * the test setup uses a fresh cache key to avoid reusing an app with different
 * provider wiring.
 */
export interface ProviderOverride {
  provider: Type<unknown> | Abstract<unknown> | string | symbol
  useValue: unknown
}

/**
 * Options for creating an integration-style test setup.
 *
 * Cache behavior:
 * - without `providerOverrides`, the requested module is reused across setups
 * - with `providerOverrides` and no `moduleKey`, a fresh app is created
 * - with both `providerOverrides` and `moduleKey`, app reuse is opt-in and
 *   controlled by the caller
 */
export interface TestSetupOptions {
  /** Explicit cache key to reuse a compiled app for matching setup calls. */
  moduleKey?: ModuleCacheKey
  /** Provider overrides applied before compiling the Nest testing module. */
  providerOverrides?: ProviderOverride[]
}

export class TestBench {
  private static _apps: Map<ModuleCacheKey, TestApp> = new Map()
  private static _isUnitTestSetup: boolean = false
  private static _dataSource: DataSource | undefined
  private static _authContext: TestAuthContext | undefined

  /**
   * Creates a test setup from the {@link ApiModule}.
   * @param options test setup options, including optional provider overrides and cache key
   */
  static async setupEndToEndTest (options: TestSetupOptions = {}): Promise<TestSetup> {
    return this.setupIntegrationTest(ApiModule, {
      ...options,
      moduleKey: this.resolveModuleKey(ApiModule, options)
    })
  }

  /**
   * Creates a test setup for a module, wraps the module in the top level AppModule
   * @param module top level module
   * @param options test setup options, including optional provider overrides and cache key
   * @example setupModuleTest(SystemWorkerModule)
   */
  static async setupModuleTest (
    module: Type<unknown> | DynamicModule,
    options: TestSetupOptions = {}
  ): Promise<TestSetup> {
    return await TestBench.setupIntegrationTest(AppModule.forRoot([module]), {
      ...options,
      moduleKey: this.resolveModuleKey(module, options)
    })
  }

  /**
   * Creates a test setup for a given top level module
   * @param module top level module
   * @param options test setup options, including optional provider overrides and cache key
   */
  static async setupIntegrationTest (
    module: Type<unknown> | DynamicModule,
    options: TestSetupOptions = {}
  ): Promise<TestSetup> {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('NODE_ENV must be set to test')
    }

    this.setupUnitTest()
    const app = await this.initApp(module, {
      ...options,
      moduleKey: this.resolveModuleKey(module, options)
    })

    return await TestSetup.create(app)
  }

  /** Prepares the test environment for a unit test */
  static setupUnitTest (): void {
    if (process.env.NODE_ENV !== 'test') {
      throw new Error('NODE_ENV must be set to test')
    }

    afterEach(() => restore())

    if (!this._isUnitTestSetup) {
      this.extendExpect()
      this._isUnitTestSetup = true
    }
  }

  /** Closes the {@link ApiModule} if initialised, not meant to be called directly */
  static async tearDown (): Promise<void> {
    for (const app of this._apps.values()) {
      await app.app.close()
    }
  }

  private static async initApp (
    module: Type<unknown> | DynamicModule,
    { moduleKey = module, providerOverrides = [] }: TestSetupOptions = {}
  ): Promise<TestApp> {
    const existingApp = this._apps.get(moduleKey)

    if (existingApp) {
      return existingApp
    }

    const testModuleBuilder = Test.createTestingModule({ imports: [module] })
    if (this._dataSource) {
      testModuleBuilder.overrideProvider(DataSource).useValue(this._dataSource)
    }

    for (const { provider, useValue } of providerOverrides) {
      testModuleBuilder.overrideProvider(provider).useValue(useValue)
    }

    testModuleBuilder.overrideModule(DefaultApiThrottlerModule).useModule(TestApiThrottlerModule)

    const testModule = await testModuleBuilder.compile()

    const [app, dataSource] = await Promise.all([
      this.createApp(testModule),
      this.initializeDatabaseConnection(testModule)
    ])

    const authContext = this.mockAuth(dataSource.manager)

    const testApp: TestApp = { app, dataSource, authContext, testModule }
    this._apps.set(moduleKey, testApp)
    return testApp
  }

  private static resolveModuleKey (
    defaultModuleKey: ModuleCacheKey,
    { moduleKey, providerOverrides = [] }: TestSetupOptions
  ): ModuleCacheKey {
    if (moduleKey != null) {
      return moduleKey
    }

    if (providerOverrides.length > 0) {
      return Symbol('test-module-instance')
    }

    return defaultModuleKey
  }

  private static async initializeDatabaseConnection (testModule: TestingModule) {
    if (this._dataSource) {
      return this._dataSource
    }

    const dataSource = testModule.get(DataSource)
    const qr = dataSource.createQueryRunner()

    await qr.connect()
    Object.defineProperty(dataSource.manager, 'queryRunner', {
      configurable: true,
      value: qr
    })

    this._dataSource = dataSource

    return dataSource
  }

  private static async createApp (testModule: TestingModule): Promise<NestFastifyApplication> {
    const adapter = new FastifyAdapter({
      routerOptions: {
        querystringParser: str => qs.parse(str),
        ignoreDuplicateSlashes: false,
        caseSensitive: true,
        ignoreTrailingSlash: false,
        allowUnsafeRegex: false
      }
    })

    const app = testModule.createNestApplication<NestFastifyApplication>(adapter)

    applyHttpConventions(app)

    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    return app
  }

  private static mockAuth (manager: EntityManager): TestAuthContext {
    if (this._authContext) {
      return this._authContext
    }

    this._authContext = new TestAuthContext(manager)
    mock.method(UserAuthenticator.prototype, 'authenticate', async (token: string) => {
      const context = this._authContext!
      const user = context.resolveUser(token)
      const authorizedUser: AuthenticatedUser = {
        type: 'user',
        userUuid: user.uuid,
        userId: user.userId
      }
      return Promise.resolve(authorizedUser)
    })

    return this._authContext
  }

  private static extendExpect (): void {
    expect.extend({
      uuid,
      toHaveErrorCode,
      toHaveStatus,
      isEnumValue,
      toHaveApiError,
      toHaveValidationErrors,
      toHaveEmitted,
      ISO8601
    })
  }
}
