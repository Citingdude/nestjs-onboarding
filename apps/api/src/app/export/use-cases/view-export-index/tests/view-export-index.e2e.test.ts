import { after, afterEach, before, describe, it } from 'node:test'
import { stringify } from 'qs'
import request from 'supertest'
import { expect } from 'expect'
import { MultiSelectOperation } from '@wisemen/scoped-filter'
import { ExportBuilder } from '#src/app/export/entities/export.entity.builder.js'
import { ExportStatus } from '#src/app/export/entities/export-status.enum.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { FileBuilder } from '#src/modules/files/entities/file.entity.builder.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { MimeType } from '#src/modules/files/enums/mime-type.enum.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { ViewExportIndexResponse } from '#src/app/export/use-cases/view-export-index/view-export-index.response.js'

describe('View export index e2e tests', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let otherUserWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.EXPORT_READ])
    otherUserWithPermission = await setup.authContext.getUser([Permission.EXPORT_READ])
    userWithoutPermission = await setup.authContext.getUser([Permission.CONTACT_READ])
  })

  after(async () => {
    await setup.teardown()
  })

  afterEach(async () => {
    await setup.entityManager.clear(Export)
  })

  it('returns the authenticated user exports ordered by createdAt desc and uuid desc with derived file names', async () => {
    const file = new FileBuilder()
      .withName('contacts-2026')
      .withMimeType(MimeType.CSV)
      .build()

    const oldestExport = new ExportBuilder()
      .withRequestedByUserUuid(userWithPermission.user.uuid)
      .withStatus(ExportStatus.FAILED)
      .withCreatedAt(new Date('2026-05-27T08:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T08:00:00.000Z'))
      .build()
    const secondNewestExport = new ExportBuilder()
      .withRequestedByUserUuid(userWithPermission.user.uuid)
      .withStatus(ExportStatus.CREATED)
      .withCreatedAt(new Date('2026-05-27T12:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T12:00:00.000Z'))
      .build()
    const newestExport = new ExportBuilder()
      .withRequestedByUserUuid(userWithPermission.user.uuid)
      .withStatus(ExportStatus.SUCCEEDED)
      .withFileUuid(file.uuid)
      .withCreatedAt(new Date('2026-05-27T12:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T12:00:00.000Z'))
      .build()
    const foreignExport = new ExportBuilder()
      .withRequestedByUserUuid(otherUserWithPermission.user.uuid)
      .withStatus(ExportStatus.SUCCEEDED)
      .withCreatedAt(new Date('2026-05-27T13:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T13:00:00.000Z'))
      .build()

    await setup.entityManager.insert(File, file)
    await setup.entityManager.insert(Export, [
      oldestExport,
      secondNewestExport,
      newestExport,
      foreignExport
    ])

    const response = await request(setup.httpServer)
      .get('/api/v1/exports')
      .set('Authorization', `Bearer ${userWithPermission.token}`)

    const expectedItems = [oldestExport, secondNewestExport, newestExport]
      .sort((left, right) =>
        right.createdAt.getTime() - left.createdAt.getTime()
        || right.uuid.localeCompare(left.uuid)
      )
      .map(item => ({
        uuid: item.uuid,
        createdAt: item.createdAt.toISOString(),
        status: item.status,
        type: item.type,
        fileUuid: item.fileUuid,
        fileName: item.fileUuid === file.uuid ? 'contacts-2026.csv' : null
      }))

    expect(response).toHaveStatus(200)
    expect(response.body).toEqual({
      items: expectedItems,
      meta: {
        next: {
          createdAt: oldestExport.createdAt.toISOString(),
          uuid: oldestExport.uuid
        }
      }
    })
  })

  it('returns the next page within the authenticated user scope', async () => {
    const oldestExport = new ExportBuilder()
      .withRequestedByUserUuid(userWithPermission.user.uuid)
      .withCreatedAt(new Date('2026-05-27T08:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T08:00:00.000Z'))
      .build()
    const secondExport = new ExportBuilder()
      .withRequestedByUserUuid(userWithPermission.user.uuid)
      .withCreatedAt(new Date('2026-05-27T11:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T11:00:00.000Z'))
      .build()
    const firstExport = new ExportBuilder()
      .withRequestedByUserUuid(userWithPermission.user.uuid)
      .withCreatedAt(new Date('2026-05-27T12:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T12:00:00.000Z'))
      .build()
    const foreignExport = new ExportBuilder()
      .withRequestedByUserUuid(otherUserWithPermission.user.uuid)
      .withCreatedAt(new Date('2026-05-27T13:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T13:00:00.000Z'))
      .build()

    await setup.entityManager.insert(Export, [
      oldestExport,
      secondExport,
      firstExport,
      foreignExport
    ])

    const firstResponse = await request(setup.httpServer)
      .get('/api/v1/exports')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify({ pagination: { limit: 1 } }))

    expect(firstResponse).toHaveStatus(200)
    expect(firstResponse.body.items).toEqual([
      expect.objectContaining({ uuid: firstExport.uuid })
    ])

    const secondResponse = await request(setup.httpServer)
      .get('/api/v1/exports')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify({
        pagination: {
          limit: 1,
          key: (firstResponse.body as ViewExportIndexResponse).meta.next
        }
      }))

    expect(secondResponse).toHaveStatus(200)
    expect(secondResponse.body.items).toEqual([
      expect.objectContaining({ uuid: secondExport.uuid })
    ])
  })

  it('filters exports by status within the authenticated user scope', async () => {
    const matchingExport = new ExportBuilder()
      .withRequestedByUserUuid(userWithPermission.user.uuid)
      .withStatus(ExportStatus.SUCCEEDED)
      .withCreatedAt(new Date('2026-05-27T14:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T14:00:00.000Z'))
      .build()
    const filteredOutOwnExport = new ExportBuilder()
      .withRequestedByUserUuid(userWithPermission.user.uuid)
      .withStatus(ExportStatus.FAILED)
      .withCreatedAt(new Date('2026-05-27T15:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T15:00:00.000Z'))
      .build()
    const filteredOutForeignExport = new ExportBuilder()
      .withRequestedByUserUuid(otherUserWithPermission.user.uuid)
      .withStatus(ExportStatus.SUCCEEDED)
      .withCreatedAt(new Date('2026-05-27T16:00:00.000Z'))
      .withUpdatedAt(new Date('2026-05-27T16:00:00.000Z'))
      .build()

    await setup.entityManager.insert(Export, [
      matchingExport,
      filteredOutOwnExport,
      filteredOutForeignExport
    ])

    const response = await request(setup.httpServer)
      .get('/api/v1/exports')
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .query(stringify({
        filter: {
          status: {
            operation: MultiSelectOperation.INCLUDE,
            values: [ExportStatus.SUCCEEDED]
          }
        }
      }))

    expect(response).toHaveStatus(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        uuid: matchingExport.uuid,
        status: ExportStatus.SUCCEEDED
      })
    ])
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get('/api/v1/exports')
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
