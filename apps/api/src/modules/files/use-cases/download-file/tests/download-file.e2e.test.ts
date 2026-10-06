import { before, describe, it, after } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { DataSource } from 'typeorm'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Download file end to end tests', () => {
  let setup: TestSetup
  let dataSource: DataSource
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    dataSource = setup.dataSource

    userWithPermission = await setup.authContext.getUser([Permission.FILE_READ])
    userWithoutPermission = await setup.authContext.getUser([Permission.FILE_CREATE])
  })

  after(async () => await setup.teardown())

  it('responds with a redirect when downloading a file', async () => {
    const file = new FileBuilder().build()
    await dataSource.manager.insert(File, file)

    const response = await request(setup.httpServer)
      .post(`/api/v1/files/${file.uuid}/download`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(302)
  })

  it('responds with a redirect when downloading a file with troublesome characters in the filename', async () => {
    const file = new FileBuilder()
      .withName('DECOMPTE _ tableau décompte au vendeur (avec calculs)_21891843.pdf')
      .build()

    await dataSource.manager.insert(File, file)

    const response = await request(setup.httpServer)
      .post(`/api/v1/files/${file.uuid}/download`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    expect(response).toHaveStatus(302)
  })

  it('returns 403 when user does not have permission', async () => {
    const file = new FileBuilder().build()
    await dataSource.manager.insert(File, file)

    const response = await request(setup.httpServer)
      .post(`/api/v1/files/${file.uuid}/download`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
