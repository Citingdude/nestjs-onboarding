import { after, before, describe, it } from 'node:test'
import { stringify } from 'qs'
import request from 'supertest'
import { expect } from 'expect'
import { generateUuid } from '@wisemen/nestjs-common'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import type { ViewApiKeyIndexQueryKey } from '#src/modules/auth/api-key/use-cases/view-api-key-index/view-api-key-index.query-key.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'

function buildApiKey (
  userUuid: UserUuid,
  overrides: Partial<ApiKey> = {}
): ApiKey {
  const apiKey = new ApiKey()
  apiKey.uuid = generateUuid<ApiKeyUuid>()
  apiKey.createdAt = new Date('2026-05-27T10:00:00.000Z')
  apiKey.deletedAt = null
  apiKey.expiresAt = null
  apiKey.name = 'Primary integration key'
  apiKey.permissions = [Permission.CONTACT_READ]
  apiKey.secretHash = `secret-hash-${apiKey.uuid}`
  apiKey.secretLastChars = 'abcde'
  apiKey.userUuid = userUuid

  return Object.assign(apiKey, overrides)
}

describe('View api key index e2e tests', () => {
  let setup: TestSetup
  let adminReader: TestUser
  let ownReader: TestUser
  let secondaryOwner: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    adminReader = await setup.authContext.getUser([Permission.API_KEY_READ])
    ownReader = await setup.authContext.getUser([Permission.API_KEY_READ_OWN])
    secondaryOwner = await setup.authContext.getUser([Permission.API_KEY_READ_OWN])
    userWithoutPermission = await setup.authContext.getUser([Permission.CONTACT_READ])
  })

  after(async () => await setup.teardown())

  it('returns all non-deleted api keys for admins ordered by createdAt desc and uuid desc with creator data', async () => {
    const olderApiKey = buildApiKey(adminReader.user.uuid, {
      uuid: '00000000-0000-0000-0000-000000000001' as ApiKeyUuid,
      name: 'Older key',
      secretLastChars: 'older',
      createdAt: new Date('2026-05-27T08:00:00.000Z')
    })
    const secondNewestApiKey = buildApiKey(adminReader.user.uuid, {
      uuid: '00000000-0000-0000-0000-000000000002' as ApiKeyUuid,
      name: 'Second newest key',
      secretLastChars: 'newer',
      createdAt: new Date('2026-05-27T12:00:00.000Z')
    })
    const newestApiKey = buildApiKey(secondaryOwner.user.uuid, {
      uuid: '00000000-0000-0000-0000-000000000003' as ApiKeyUuid,
      name: 'Newest key',
      secretLastChars: 'fresh',
      createdAt: new Date('2026-05-27T12:00:00.000Z')
    })
    const deletedApiKey = buildApiKey(adminReader.user.uuid, {
      name: 'Deleted key',
      deletedAt: new Date('2026-05-27T13:00:00.000Z')
    })

    await setup.entityManager.save(ApiKey, [
      olderApiKey,
      secondNewestApiKey,
      newestApiKey,
      deletedApiKey
    ])

    const response = await request(setup.httpServer)
      .get('/api/v1/api-keys')
      .set('Authorization', `Bearer ${adminReader.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body).toEqual(expect.objectContaining({
      items: [
        expect.objectContaining({
          uuid: newestApiKey.uuid,
          name: 'Newest key',
          userUuid: secondaryOwner.user.uuid,
          userEmail: secondaryOwner.user.email,
          maskedKey: expect.stringMatching(/\*+fresh$/)
        }),
        expect.objectContaining({
          uuid: secondNewestApiKey.uuid,
          name: 'Second newest key',
          userUuid: adminReader.user.uuid,
          userEmail: adminReader.user.email,
          maskedKey: expect.stringMatching(/\*+newer$/)
        }),
        expect.objectContaining({
          uuid: olderApiKey.uuid,
          name: 'Older key',
          userUuid: adminReader.user.uuid,
          userEmail: adminReader.user.email,
          maskedKey: expect.stringMatching(/\*+older$/)
        })
      ],
      meta: expect.objectContaining({
        next: expect.objectContaining({
          createdAt: olderApiKey.createdAt.toISOString(),
          uuid: olderApiKey.uuid
        })
      })
    }))
  })

  it('returns only owned api keys for own-read users', async () => {
    const ownApiKey = buildApiKey(ownReader.user.uuid, {
      uuid: '00000000-0000-0000-0000-000000000010' as ApiKeyUuid,
      name: 'Own key',
      createdAt: new Date('2026-05-27T11:00:00.000Z')
    })
    const otherApiKey = buildApiKey(secondaryOwner.user.uuid, {
      uuid: '00000000-0000-0000-0000-000000000011' as ApiKeyUuid,
      name: 'Other user key',
      createdAt: new Date('2026-05-27T12:00:00.000Z')
    })

    await setup.entityManager.save(ApiKey, [ownApiKey, otherApiKey])

    const response = await request(setup.httpServer)
      .get('/api/v1/api-keys')
      .set('Authorization', `Bearer ${ownReader.token}`)

    expect(response).toHaveStatus(200)
    expect(response.body.items).toEqual([
      expect.objectContaining({
        uuid: ownApiKey.uuid,
        userUuid: ownReader.user.uuid,
        userEmail: ownReader.user.email
      })
    ])
  })

  it('returns the next page when using the keyset key within the owner scope', async () => {
    const oldestApiKey = buildApiKey(ownReader.user.uuid, {
      uuid: generateUuid<ApiKeyUuid>(),
      name: 'Oldest key',
      createdAt: new Date('2026-05-27T08:00:00.000Z')
    })
    const secondApiKey = buildApiKey(ownReader.user.uuid, {
      uuid: generateUuid<ApiKeyUuid>(),
      name: 'Second key',
      createdAt: new Date('2026-05-27T11:00:00.000Z')
    })
    const firstApiKey = buildApiKey(ownReader.user.uuid, {
      uuid: generateUuid<ApiKeyUuid>(),
      name: 'First key',
      createdAt: new Date('2026-05-27T12:00:00.000Z')
    })
    const foreignApiKey = buildApiKey(secondaryOwner.user.uuid, {
      uuid: generateUuid<ApiKeyUuid>(),
      name: 'Foreign key',
      createdAt: new Date('2026-05-27T13:00:00.000Z')
    })

    await setup.entityManager.save(ApiKey, [oldestApiKey, secondApiKey, firstApiKey, foreignApiKey])

    const firstResponse = await request(setup.httpServer)
      .get('/api/v1/api-keys')
      .set('Authorization', `Bearer ${ownReader.token}`)
      .query(stringify({ pagination: { limit: 1 } }))

    expect(firstResponse).toHaveStatus(200)
    expect(firstResponse.body.items).toEqual([
      expect.objectContaining({ uuid: firstApiKey.uuid })
    ])

    const secondResponse = await request(setup.httpServer)
      .get('/api/v1/api-keys')
      .set('Authorization', `Bearer ${ownReader.token}`)
      .query(stringify({
        pagination: {
          limit: 1,
          key: firstResponse.body.meta.next as ViewApiKeyIndexQueryKey
        }
      }))

    expect(secondResponse).toHaveStatus(200)
    expect(secondResponse.body.items).toEqual([
      expect.objectContaining({ uuid: secondApiKey.uuid })
    ])
  })

  it('filters api keys by search within the owner scope', async () => {
    const findableApiKey = buildApiKey(ownReader.user.uuid, {
      name: 'Searchable integration key',
      createdAt: new Date('2026-05-27T14:00:00.000Z')
    })
    const otherApiKey = buildApiKey(ownReader.user.uuid, {
      name: 'Other key',
      createdAt: new Date('2026-05-27T15:00:00.000Z')
    })
    const foreignMatchingApiKey = buildApiKey(secondaryOwner.user.uuid, {
      name: 'Searchable but foreign key',
      createdAt: new Date('2026-05-27T16:00:00.000Z')
    })

    await setup.entityManager.save(ApiKey, [findableApiKey, otherApiKey, foreignMatchingApiKey])

    const response = await request(setup.httpServer)
      .get('/api/v1/api-keys')
      .set('Authorization', `Bearer ${ownReader.token}`)
      .query({ search: 'Searchable' })

    expect(response).toHaveStatus(200)
    expect(response.body).toEqual(expect.objectContaining({
      items: [expect.objectContaining({ uuid: findableApiKey.uuid })],
      meta: expect.objectContaining({
        next: expect.objectContaining({ uuid: findableApiKey.uuid })
      })
    }))
  })

  it('returns 403 when user does not have permission', async () => {
    const response = await request(setup.httpServer)
      .get('/api/v1/api-keys')
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)

    expect(response).toHaveStatus(403)
  })
})
