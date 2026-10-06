import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { JwtService } from '@nestjs/jwt'
import { generateUuid } from '@wisemen/nestjs-common'
import { InvalidPublicFileTokenError } from '#src/modules/files/errors/invalid-public-file-token.error.js'
import { FilePresigner } from '#src/modules/files/modules/file-presigner/file-presigner.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { File } from '#src/modules/files/entities/file.entity.js'
import { DownloadPublicFileUseCase } from '#src/modules/files/use-cases/download-public-file/download-public-file.use-case.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { PresignedFileBuilder } from '#src/modules/files/entities/presigned-file.builder.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'

describe('Download public file use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('throws when the public file does not exist', async () => {
    const dataSource = stubDataSource()
    const repository = createStubInstance(TypeOrmRepository<File>)
    repository.findOneBy.resolves(null)

    const tokenUuid = generateUuid<FileUuid>()

    const presigner = createStubInstance(FilePresigner)
    const jwtService = createStubInstance(JwtService)
    jwtService.verifyAsync.resolves({
      service: 'public-file-download',
      fileUuid: tokenUuid
    })

    const useCase = new DownloadPublicFileUseCase(dataSource, repository, presigner, jwtService)

    await expect(useCase.execute(tokenUuid, 'token')).rejects.toThrow(FileNotFoundError)
  })

  it('returns a presigned response when the public file exists', async () => {
    const file = new FileBuilder()
      .withIsPublic(true)
      .build()

    const dataSource = stubDataSource()
    const repository = createStubInstance(TypeOrmRepository<File>)
    repository.findOneBy.resolves(file)

    const presignedFile = new PresignedFileBuilder()
      .withFile(file)
      .withUrl('https://example.com/file')
      .build()

    const presigner = createStubInstance(FilePresigner)
    presigner.presign.resolves(presignedFile)

    const jwtService = createStubInstance(JwtService)
    jwtService.verifyAsync.resolves({
      service: 'public-file-download',
      fileUuid: file.uuid
    })

    const useCase = new DownloadPublicFileUseCase(dataSource, repository, presigner, jwtService)

    const response = await useCase.execute(file.uuid, 'token')

    expect(presigner.presign.calledOnceWithExactly(file)).toBe(true)
    expect(response.uuid).toBe(file.uuid)
    expect(response.url).toBe(presignedFile.url)
  })

  it('throws when the token is not for public file downloads', async () => {
    const dataSource = stubDataSource()
    const repository = createStubInstance(TypeOrmRepository<File>)
    const presigner = createStubInstance(FilePresigner)
    const jwtService = createStubInstance(JwtService)
    jwtService.verifyAsync.resolves({
      service: 'another-service'
    })

    const useCase = new DownloadPublicFileUseCase(dataSource, repository, presigner, jwtService)

    await expect(useCase.execute(generateUuid(), 'token')).rejects.toThrow(InvalidPublicFileTokenError)
  })

  it('throws when the token file uuid does not match the requested file', async () => {
    const dataSource = stubDataSource()
    const repository = createStubInstance(TypeOrmRepository<File>)
    const presigner = createStubInstance(FilePresigner)
    const jwtService = createStubInstance(JwtService)
    jwtService.verifyAsync.resolves({
      service: 'public-file-download',
      fileUuid: 'other-file'
    })

    const useCase = new DownloadPublicFileUseCase(dataSource, repository, presigner, jwtService)

    await expect(useCase.execute(generateUuid(), 'token')).rejects.toThrow(InvalidPublicFileTokenError)
  })
})
