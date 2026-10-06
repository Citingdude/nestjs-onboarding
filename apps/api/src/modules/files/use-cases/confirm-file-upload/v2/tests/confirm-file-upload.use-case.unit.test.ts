import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { assert, createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { ConfirmFileUploadUseCase } from '#src/modules/files/use-cases/confirm-file-upload/v2/confirm-file-upload.use-case.js'
import { FileUploadedEvent } from '#src/modules/files/use-cases/confirm-file-upload/v2/file-uploaded.event.js'
import { ConfirmFileUploadCommandBuilder } from '#src/modules/files/use-cases/confirm-file-upload/v2/confirm-file-upload.command.builder.js'
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

    const command = new ConfirmFileUploadCommandBuilder().build()

    await expect(useCase.execute(generateUuid(), command)).rejects.toThrow()
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

    const command = new ConfirmFileUploadCommandBuilder().build()

    await useCase.execute(generateUuid(), command)

    expect(eventEmitter).toHaveEmitted(new FileUploadedEvent(file))
  })
})
