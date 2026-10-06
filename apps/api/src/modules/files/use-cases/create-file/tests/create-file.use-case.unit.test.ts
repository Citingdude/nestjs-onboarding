import { before, describe, it } from 'node:test'
import { randomUUID } from 'crypto'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { TestFileStorage } from '@wisemen/nestjs-file-storage'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { CreateFileCommandBuilder } from './create-file.command.builder.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { CreateFileUseCase } from '#src/modules/files/use-cases/create-file/create-file.use-case.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { FileCreatedEvent } from '#src/modules/files/use-cases/create-file/file-created.event.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

describe('CreateFile use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('emits an event when a file is created', async () => {
    const command = new CreateFileCommandBuilder().build()
    const userUuid = generateUuid<UserUuid>()

    const eventEmitter = createStubInstance(DomainEventEmitter)

    const repository = createStubInstance(TypeOrmRepository)
    repository.create.returns({
      name: command.name,
      mimeType: command.mimeType,
      userUuid: randomUUID()
    })

    const fileStorage = createStubInstance(TestFileStorage)
    const authContext = createStubInstance(AuthContext)
    const keyFactory = createStubInstance(FileStorageKeyFactory)
    authContext.getUserUuid.returns(null)
    keyFactory.create.returns('some/storage/key.png')

    const useCase = new CreateFileUseCase(
      stubDataSource(),
      eventEmitter,
      repository,
      fileStorage,
      keyFactory
    )

    const response = await useCase.execute(command, userUuid)

    const expectedFile = new FileBuilder()
      .withUuid(response.uuid)
      .withName(command.name)
      .build()

    expect(eventEmitter).toHaveEmitted(new FileCreatedEvent(expectedFile))
  })
})
