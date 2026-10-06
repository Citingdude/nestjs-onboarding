import { before, describe, it, after } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { DataSource } from 'typeorm'
import { ConfirmFileUploadCommandBuilder } from '#src/modules/files/use-cases/confirm-file-upload/v2/confirm-file-upload.command.builder.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Confirm file upload v2 end to end tests', () => {
  let setup: TestSetup
  let dataSource: DataSource
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    dataSource = setup.dataSource

    userWithPermission = await setup.authContext.getUser([Permission.FILE_CREATE])
    userWithoutPermission = await setup.authContext.getUser([Permission.FILE_READ])
  })

  after(async () => await setup.teardown())

  it('marks a file as uploaded', async () => {
    const file = new FileBuilder().build()
    await dataSource.manager.insert(File, file)

    const command = new ConfirmFileUploadCommandBuilder()
      .withBlurHash('LEHLk~WB2yk8pyo0adR*.7kCMdnj')
      .build()

    const response = await request(setup.httpServer)
      .post(`/api/v2/files/${file.uuid}/confirm-upload`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(204)

    const savedFile = await dataSource.manager.findOneBy(File, { uuid: file.uuid })

    expect(savedFile?.blurHash).toBe(command.blurHash)
  })

  it('returns 403 when user does not have permission', async () => {
    const file = new FileBuilder().build()
    await dataSource.manager.insert(File, file)

    const command = new ConfirmFileUploadCommandBuilder()
      .withBlurHash('LEHLk~WB2yk8pyo0adR*.7kCMdnj')
      .build()

    const response = await request(setup.httpServer)
      .post(`/api/v2/files/${file.uuid}/confirm-upload`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
