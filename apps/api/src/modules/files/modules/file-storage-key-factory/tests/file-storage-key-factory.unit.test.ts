import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { ConfigService } from '@nestjs/config'
import { generateUuid } from '@wisemen/nestjs-common'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { MimeType } from '#src/modules/files/enums/mime-type.enum.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

describe('Create file storage key use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('creates a private storage key by default', () => {
    const configService = createStubInstance(ConfigService)
    configService.getOrThrow.returns('test')

    const factory = new FileStorageKeyFactory(configService)
    const fileUuid = generateUuid<FileUuid>()

    const key = factory.create({ fileUuid, mimeType: MimeType.PNG })

    expect(key).toBe(`test/${fileUuid}.png`)
  })

  it('creates a public storage key when requested', () => {
    const configService = createStubInstance(ConfigService)
    configService.getOrThrow.returns('test')

    const factory = new FileStorageKeyFactory(configService)
    const fileUuid = generateUuid<FileUuid>()

    const key = factory.create({
      fileUuid,
      mimeType: MimeType.PNG,
      isPublic: true
    })

    expect(key).toBe(`test/public/${fileUuid}.png`)
  })

  it('creates a variant key in the same visibility prefix', () => {
    const configService = createStubInstance(ConfigService)
    configService.getOrThrow.returns('test')

    const factory = new FileStorageKeyFactory(configService)
    const fileUuid = generateUuid<FileUuid>()

    const privateKey = factory.create({
      fileUuid,
      mimeType: MimeType.PNG,
      isPublic: false,
      variantLabel: 'thumb'
    })

    const publicKey = factory.create({
      fileUuid,
      mimeType: MimeType.PNG,
      isPublic: true,
      variantLabel: 'thumb'
    })

    expect(privateKey).toBe(`test/${fileUuid}-thumb.png`)
    expect(publicKey).toBe(`test/public/${fileUuid}-thumb.png`)
  })
})
