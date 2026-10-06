import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { assert, createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { ConfirmFileUploadUseCase } from '#src/modules/files/use-cases/confirm-file-upload/v1/confirm-file-upload.use-case.js'
import type { File } from '#src/modules/files/entities/file.entity.js'
import { FileUploadedEvent } from '#src/modules/files/use-cases/confirm-file-upload/v1/file-uploaded.event.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'

describe('Confirm file upload use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when the file does not exist', async () => {
    const fileRepository = createStubInstance(TypeOrmRepository<File>)
    fileRepository.findOneBy.resolves(null)

    const useCase = new ConfirmFileUploadUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),

      fileRepository
    )

    await expect(useCase.execute(generateUuid())).rejects.toThrow()
    assert.notCalled(fileRepository.update)
  })

  it('emits an event when the file has been marked as uploaded', async () => {
    const fileRepository = createStubInstance(TypeOrmRepository<File>)
    const file = new FileBuilder().build()
    fileRepository.findOneBy.resolves(file)

    const eventEmitter = createStubInstance(DomainEventEmitter)
    const useCase = new ConfirmFileUploadUseCase(
      stubDataSource(),
      eventEmitter,
      fileRepository
    )

    await useCase.execute(generateUuid())

    expect(eventEmitter).toHaveEmitted(new FileUploadedEvent(file))
  })
})
