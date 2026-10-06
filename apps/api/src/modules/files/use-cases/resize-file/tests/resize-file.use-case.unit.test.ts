import { before, describe, it } from 'node:test'
import { assert, createStubInstance } from 'sinon'
import { expect } from 'expect'
import { TestFileStorage } from '@wisemen/nestjs-file-storage'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { ResizeFileUseCase } from '#src/modules/files/use-cases/resize-file/resize-file.use-case.js'
import { ResizeFileRepository } from '#src/modules/files/use-cases/resize-file/resize-file.repository.js'
import { ImageResizer } from '#src/modules/image-resize/image-resizer.js'
import type { ResizeFileVariant } from '#src/modules/files/use-cases/resize-file/job/resize-file.job.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { FileVariantCreatedEvent } from '#src/modules/files/use-cases/resize-file/file-variant.created.event.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'

describe('Resize file use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('does nothing if the file does not exist', async () => {
    const repository = createStubInstance(ResizeFileRepository)
    const fileStorage = createStubInstance(TestFileStorage)
    const fileStorageFactory = createStubInstance(FileStorageKeyFactory)
    const imageResizer = createStubInstance(ImageResizer)
    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new ResizeFileUseCase(
      stubDataSource(),
      repository,
      fileStorage,
      fileStorageFactory,
      imageResizer,
      eventEmitter
    )

    repository.getFile.resolves(null)

    await useCase.execute(generateUuid(), [])

    assert.calledOnce(repository.getFile)
    assert.notCalled(fileStorage.createTemporaryDownloadUrl)
    assert.notCalled(fileStorage.createTemporaryUploadUrl)
    assert.notCalled(fileStorageFactory.createFromFile)
    assert.notCalled(imageResizer.resize)
    assert.notCalled(repository.updateFile)
    assert.notCalled(eventEmitter.emit)
  })

  it('emits an event for every variant', async () => {
    const repository = createStubInstance(ResizeFileRepository)
    const fileStorage = createStubInstance(TestFileStorage)
    const fileStorageKeyFactory = createStubInstance(FileStorageKeyFactory)
    const imageResizer = createStubInstance(ImageResizer)
    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new ResizeFileUseCase(
      stubDataSource(),
      repository,
      fileStorage,
      fileStorageKeyFactory,
      imageResizer,
      eventEmitter
    )

    const file = new FileBuilder().build()
    const variants: ResizeFileVariant[] = [
      { label: 'small', width: 100, height: 100 },
      { label: 'medium', width: 500, height: 500 }
    ]

    repository.getFile.resolves(file)

    await useCase.execute(file.uuid, variants)

    assert.calledOnce(repository.getFile)
    assert.calledOnce(fileStorage.createTemporaryDownloadUrl)
    assert.calledTwice(fileStorage.createTemporaryUploadUrl)
    assert.calledTwice(fileStorageKeyFactory.createFromFile)
    assert.calledOnce(imageResizer.resize)
    assert.calledOnce(repository.updateFile)
    assert.calledOnce(eventEmitter.emit)

    expect(eventEmitter).toHaveEmitted(
      new FileVariantCreatedEvent(file.uuid, 'small'),
      new FileVariantCreatedEvent(file.uuid, 'medium')
    )
  })
})
