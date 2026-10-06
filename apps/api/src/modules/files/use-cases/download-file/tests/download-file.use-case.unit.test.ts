import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { assert, createStubInstance } from 'sinon'
import { expect } from 'expect'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { File } from '#src/modules/files/entities/file.entity.js'
import { DownloadFileUseCase } from '#src/modules/files/use-cases/download-file/download-file.use-case.js'
import { FilePresigner } from '#src/modules/files/modules/file-presigner/file-presigner.js'

describe('Download file use case unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('should return 404 when the file does not exist', async () => {
    const dataSource = stubDataSource()
    const fileRepository = createStubInstance(TypeOrmRepository<File>)
    fileRepository.findOneBy.resolves(null)

    const filePresigner = createStubInstance(FilePresigner)
    const useCase = new DownloadFileUseCase(
      dataSource,
      fileRepository,
      filePresigner
    )

    await expect(useCase.execute(generateUuid())).rejects.toThrow()
    assert.notCalled(filePresigner.presign)
  })
})
