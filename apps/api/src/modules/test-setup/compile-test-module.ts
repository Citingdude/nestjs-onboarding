import { Test, type TestingModule } from '@nestjs/testing'
import type { DynamicModule, Type } from '@nestjs/common'
import { TestModule } from './test.module.js'

export async function compileTestModule (
  modules: Array<DynamicModule | Type<unknown>> = [],
  migrationsRun = false
): Promise<TestingModule> {
  return await Test.createTestingModule({ imports: [TestModule.forRoot(modules, migrationsRun)] })
    .compile()
}
