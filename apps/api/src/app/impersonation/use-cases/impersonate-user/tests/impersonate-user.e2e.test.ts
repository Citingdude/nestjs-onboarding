import { before, describe, it, after, mock, afterEach } from 'node:test'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { expect } from 'expect'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { ImpersonationTokenService } from '#src/app/impersonation/services/impersonation-token.service.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UserRoleBuilder } from '#src/modules/auth/roles/entities/user-role.entity.builder.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

describe('Impersonate user end to end tests', () => {
  let setup: TestSetup
  let impersonator: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    impersonator = await setup.authContext.getUser([Permission.USER_IMPERSONATE])
    userWithoutPermission = await setup.authContext.getUser([Permission.USER_READ])
  })

  let exchangeTokenMock: ReturnType<typeof mock.method> | undefined

  afterEach(() => exchangeTokenMock?.mock.restore())
  after(async () => await setup.teardown())

  function stubExchange (): void {
    exchangeTokenMock = mock.method(ImpersonationTokenService.prototype, 'exchangeToken', () => Promise.resolve({
      accessToken: 'impersonated-token',
      expiresIn: 3600
    }))
  }

  it('returns 403 when the caller lacks user.impersonate', async () => {
    stubExchange()
    const target = await setup.authContext.getUser([Permission.USER_READ])

    const response = await request(setup.httpServer)
      .post('/api/v1/impersonation')
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send({ targetUserUuid: target.user.uuid })

    expect(response).toHaveStatus(403)
  })

  it('mints an impersonated token for an eligible target', async () => {
    stubExchange()
    const target = await setup.authContext.getUser([Permission.USER_READ])

    const response = await request(setup.httpServer)
      .post('/api/v1/impersonation')
      .set('Authorization', `Bearer ${impersonator.token}`)
      .send({ targetUserUuid: target.user.uuid })

    expect(response).toHaveStatus(201)
    expect(response.body.accessToken).toBe('impersonated-token')
    expect(response.body.impersonatedUser.userUuid).toBe(target.user.uuid)
  })

  it('emits a UserImpersonatedEvent for an eligible target', async () => {
    stubExchange()
    const target = await setup.authContext.getUser([Permission.USER_READ])

    await request(setup.httpServer)
      .post('/api/v1/impersonation')
      .set('Authorization', `Bearer ${impersonator.token}`)
      .send({ targetUserUuid: target.user.uuid })

    const log = await setup.entityManager.findOneBy(DomainEventLog, {
      type: DomainEventType.USER_IMPERSONATED,
      subjectId: target.user.uuid
    })
    expect(log).not.toBeNull()
  })

  it('returns 404 for a non-existent target', async () => {
    stubExchange()
    const response = await request(setup.httpServer)
      .post('/api/v1/impersonation')
      .set('Authorization', `Bearer ${impersonator.token}`)
      .send({ targetUserUuid: randomUUID() })

    expect(response).toHaveStatus(404)
  })

  it('returns 403 for a privileged (non-eligible) target', async () => {
    stubExchange()
    const adminTarget = await setup.authContext.getUser([Permission.ALL_PERMISSIONS])

    const response = await request(setup.httpServer)
      .post('/api/v1/impersonation')
      .set('Authorization', `Bearer ${impersonator.token}`)
      .send({ targetUserUuid: adminTarget.user.uuid })

    expect(response).toHaveStatus(403)
  })

  it('returns 403 for a target whose role is flagged isSystemAdmin (even without ALL_PERMISSIONS)', async () => {
    stubExchange()

    const adminRole = await setup.authContext.getAdminRole()
    const originalPermissions = adminRole.permissions

    await setup.entityManager.update(Role, { uuid: adminRole.uuid }, {
      permissions: [Permission.USER_READ]
    })

    const user = new UserBuilder()
      .withEmail(`${randomUUID()}@mail.com`)
      .build()
    await setup.entityManager.insert(User, user)

    const userRole = new UserRoleBuilder()
      .withUserUuid(user.uuid)
      .withRoleUuid(adminRole.uuid)
      .build()
    await setup.entityManager.insert(UserRole, userRole)

    try {
      const response = await request(setup.httpServer)
        .post('/api/v1/impersonation')
        .set('Authorization', `Bearer ${impersonator.token}`)
        .send({ targetUserUuid: user.uuid })

      expect(response).toHaveStatus(403)
    } finally {
      await setup.entityManager.update(Role, { uuid: adminRole.uuid }, {
        permissions: originalPermissions
      })
    }
  })
})
