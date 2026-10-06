import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { ConfigService } from '@nestjs/config'
import { generateUuid } from '@wisemen/nestjs-common'
import { AuthCalloutPermissions } from '#src/app/auth-callout/auth-callout-permissions.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { AuthenticatedApiKey, AuthenticatedUser } from '#src/modules/auth/authentication/auth-principal.type.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { PermissionSet } from '#src/modules/auth/permission/permission-set.js'
import { AuthorizationService } from '#src/modules/auth/authorization/authorization.service.js'

describe('AuthCalloutPermissions unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('allows all subjects when user has ALL_PERMISSIONS', async () => {
    const config = createStubInstance(ConfigService)
    config.getOrThrow.returns('test')

    const authzService = createStubInstance(AuthorizationService)
    authzService.getPermissions.resolves(new PermissionSet([Permission.ALL_PERMISSIONS], true))

    const auth: AuthenticatedUser = {
      type: 'user',
      userUuid: generateUuid<UserUuid>(),
      userId: 'user-id'
    }

    const authCalloutPermissions = new AuthCalloutPermissions(config, authzService)

    const result = await authCalloutPermissions.getPermissionsFor(auth)

    expect(result.sub.allow?.length).toBeGreaterThan(1)
  })

  it('limits api key subjects to api key permissions', async () => {
    const config = createStubInstance(ConfigService)
    config.getOrThrow.returns('test')

    const auth: AuthenticatedApiKey = {
      type: 'api-key',
      apiKeyUuid: generateUuid<ApiKeyUuid>(),
      permissions: [Permission.CONTACT_READ],
      userUuid: generateUuid<UserUuid>(),
      userId: 'user-id'
    }

    const authzService = createStubInstance(AuthorizationService)
    authzService.getPermissions.resolves(new PermissionSet([Permission.CONTACT_READ], false))

    const webappNatsPermissions = new AuthCalloutPermissions(config, authzService)

    const result = await webappNatsPermissions.getPermissionsFor(auth)

    expect(authzService.getPermissions.calledOnceWithExactly(auth)).toBe(true)
    expect(result.sub.allow?.some(subject => subject.endsWith('.contact.*.created'))).toBe(true)
  })
})
