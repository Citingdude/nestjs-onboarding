import { DataSource } from 'typeorm'
import type { TestingModule } from '@nestjs/testing'
import { compileTestModule } from './compile-test-module.js'
import { TypesenseCollectionName } from '#src/modules/typesense/typesense-collection-name.enum.js'
import { MigrateCollectionsUseCase } from '#src/modules/typesense/use-cases/migrate-collections/migrate-collections.use-case.js'
import { TypesenseModule } from '#src/modules/typesense/typesense.module.js'

export async function globalSetup (): Promise<void> {
  const testingModule = await compileTestModule([TypesenseModule], true)
  await testingModule.init()

  await Promise.all([
    migrateTypesense(testingModule),
    migrateDatabase(testingModule)
  ])

  // eslint-disable-next-line no-console
  console.log('Global setup completed')
  await testingModule.close()
}

async function migrateTypesense (moduleRef: TestingModule): Promise<void> {
  const typesenseInitService = moduleRef.get(MigrateCollectionsUseCase)
  await typesenseInitService.execute(true, Object.values(TypesenseCollectionName))
}

async function migrateDatabase (testingModule: TestingModule): Promise<void> {
  const dataSource = testingModule.get(DataSource)

  if (!dataSource.isInitialized) await dataSource.initialize()

  await dataSource.runMigrations({ transaction: 'each' })
}
