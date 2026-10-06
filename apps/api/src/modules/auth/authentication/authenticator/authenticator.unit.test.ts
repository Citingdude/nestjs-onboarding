import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { generateUuid } from '@wisemen/nestjs-common'
import { Authenticator } from '#src/modules/auth/authentication/authenticator/authenticator.js'
import { UserAuthenticator } from '#src/modules/auth/users/authenticator/user-authenticator.js'
import { ApiKeyAuthenticator } from '#src/modules/auth/api-key/authenticator/api-key-authenticator.js'
import { NoAuthorizationHeaderError } from '#src/modules/auth/authentication/authenticator/no-authorization-header.error.js'
import { InvalidAuthorizationHeaderFormatError } from '#src/modules/auth/authentication/authenticator/invalid-authorization-header-format.error.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('Authenticator unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when the authorization header is missing', async () => {
    const userTokenAuthService = createStubInstance(UserAuthenticator)
    const apiKeyAuthService = createStubInstance(ApiKeyAuthenticator)
    const service = new Authenticator(userTokenAuthService, apiKeyAuthService)

    await expect(service.authenticate())
      .rejects.toThrow(new NoAuthorizationHeaderError())
  })

  it('throws an error when the authorization header is not a bearer token', async () => {
    const userTokenAuthService = createStubInstance(UserAuthenticator)
    const apiKeyAuthService = createStubInstance(ApiKeyAuthenticator)
    const service = new Authenticator(userTokenAuthService, apiKeyAuthService)

    await expect(service.authenticate('Basic abc'))
      .rejects.toThrow(new InvalidAuthorizationHeaderFormatError())
  })

  it('authenticates api key bearer tokens through api key auth', async () => {
    const userTokenAuthService = createStubInstance(UserAuthenticator)
    const apiKeyAuthService = createStubInstance(ApiKeyAuthenticator)
    const apiKey = {
      type: 'api-key' as const,
      apiKeyUuid: generateUuid<ApiKeyUuid>(),
      permissions: [Permission.CONTACT_READ],
      userUuid: generateUuid<UserUuid>(),
      userId: 'user-id'
    }
    apiKeyAuthService.authenticate.resolves(apiKey)
    const service = new Authenticator(userTokenAuthService, apiKeyAuthService)

    const result = await service.authenticate('Bearer ak_test')

    expect(result).toEqual(apiKey)
    expect(apiKeyAuthService.authenticate.calledOnceWithExactly('ak_test')).toBe(true)
    expect(userTokenAuthService.authenticate.called).toBe(false)
  })

  it('authenticates non-api-key bearer tokens through user token auth', async () => {
    const userTokenAuthService = createStubInstance(UserAuthenticator)
    const apiKeyAuthService = createStubInstance(ApiKeyAuthenticator)
    const user = {
      type: 'user' as const,
      userUuid: generateUuid<UserUuid>(),
      userId: 'user-id'
    }
    userTokenAuthService.authenticate.resolves(user)
    const service = new Authenticator(userTokenAuthService, apiKeyAuthService)

    const result = await service.authenticate('Bearer user-token')

    expect(result).toEqual(user)
    expect(userTokenAuthService.authenticate.calledOnceWithExactly('user-token')).toBe(true)
    expect(apiKeyAuthService.authenticate.called).toBe(false)
  })
})
