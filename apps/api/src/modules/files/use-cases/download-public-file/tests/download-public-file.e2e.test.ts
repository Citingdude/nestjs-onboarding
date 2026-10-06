import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { DataSource } from 'typeorm'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { FilePresigner } from '#src/modules/files/modules/file-presigner/file-presigner.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

describe('Download public file e2e tests', () => {
  let setup: TestSetup
  let dataSource: DataSource
  let filePresigner: FilePresigner

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    dataSource = setup.dataSource
    filePresigner = setup.testModule.get(FilePresigner, { strict: false })
  })

  after(async () => {
    await setup.teardown()
  })

  async function createPublicFileToken (file: File): Promise<string> {
    const url = await filePresigner.createPublicDownloadUrl(file)
    const token = new URL(url).searchParams.get('token')

    if (token == null) {
      throw new Error('Expected a token in the presigned download url')
    }

    return token
  }

  it('redirects to the presigned url with a valid token', async () => {
    const publicFile = new FileBuilder()
      .withIsPublic(true)
      .build()

    await dataSource.manager.insert(File, publicFile)

    const token = await createPublicFileToken(publicFile)

    const response = await request(setup.httpServer)
      .get(`/api/v1/public/files/${publicFile.uuid}/download`)
      .query({ token })

    expect(response).toHaveStatus(302)
  })

  it('redirects to the presigned url with a valid token with troublesome characters in the filename', async () => {
    const publicFile = new FileBuilder()
      .withIsPublic(true)
      .withName('DECOMPTE _ tableau décompte au vendeur (avec calculs)_21891843.pdf')
      .build()

    await dataSource.manager.insert(File, publicFile)

    const token = await createPublicFileToken(publicFile)

    const response = await request(setup.httpServer)
      .get(`/api/v1/public/files/${publicFile.uuid}/download`)
      .query({ token })

    expect(response).toHaveStatus(302)
  })

  it('returns unauthorized when the token does not match the file', async () => {
    const publicFile = new FileBuilder()
      .withIsPublic(true)
      .build()

    await dataSource.manager.insert(File, publicFile)

    const otherFile = new FileBuilder()
      .withIsPublic(true)
      .build()

    const token = await createPublicFileToken(otherFile)

    const response = await request(setup.httpServer)
      .get(`/api/v1/public/files/${publicFile.uuid}/download`)
      .query({ token })

    expect(response).toHaveStatus(401)
    expect(response).toHaveErrorCode('invalid_public_file_token')
  })
})
