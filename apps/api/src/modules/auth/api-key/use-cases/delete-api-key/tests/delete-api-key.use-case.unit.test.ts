import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { ApiKeyDeletedEvent } from '#src/modules/auth/api-key/use-cases/delete-api-key/api-key-deleted.event.js'
import { ApiKeyNotFoundError } from '#src/modules/auth/api-key/errors/api-key.not-found.error.js'
import { DeleteApiKeyUseCase } from '#src/modules/auth/api-key/use-cases/delete-api-key/delete-api-key.use-case.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'
import { ApiKeyAuthCache } from '#src/modules/auth/api-key/authenticator/cache/api-key-auth-cache.js'
import { PermissionSet } from '#src/modules/auth/permission/permission-set.js'

function buildApiKey (): ApiKey {
  const apiKey = new ApiKey()
  apiKey.uuid = generateUuid<ApiKeyUuid>()
  apiKey.createdAt = new Date('2026-05-27T10:00:00.000Z')
  apiKey.deletedAt = null
  apiKey.expiresAt = null
  apiKey.name = 'delete-me'
  apiKey.permissions = [Permission.CONTACT_READ]
  apiKey.secretHash = 'secret-hash'
  apiKey.secretLastChars = 'abcde'
  apiKey.userUuid = generateUuid<UserUuid>()

  return apiKey
}

describe('DeleteApiKeyUseCase unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when the api key does not exist', async () => {
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    apiKeyRepository.findOneBy.resolves(null)

    const useCase = new DeleteApiKeyUseCase(
      stubDataSource(),
      apiKeyRepository,
      createStubInstance(DomainEventEmitter),
      createStubInstance(ApiKeyAuthCache)
    )

    const apiKeyUuid = generateUuid<ApiKeyUuid>()
    const principal: AuthPrincipal = {
      type: 'user',
      userUuid: generateUuid<UserUuid>(),
      userId: 'user-id'
    }
    const permissions = new PermissionSet([], false)

    await expect(useCase.execute(apiKeyUuid, principal, permissions))
      .rejects.toThrow(new ApiKeyNotFoundError(apiKeyUuid))
  })

  it('soft deletes the api key when the owner deletes their own key', async () => {
    const apiKey = buildApiKey()
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    apiKeyRepository.findOneBy.resolves(apiKey)
    const principal: AuthPrincipal = {
      type: 'user',
      userUuid: apiKey.userUuid,
      userId: 'user-id'
    }

    const eventEmitter = createStubInstance(DomainEventEmitter)
    const apiKeyAuthCache = createStubInstance(ApiKeyAuthCache)
    const permissions = new PermissionSet([], false)
    const useCase = new DeleteApiKeyUseCase(
      stubDataSource(),
      apiKeyRepository,
      eventEmitter,
      apiKeyAuthCache
    )

    await useCase.execute(apiKey.uuid, principal, permissions)

    expect(apiKeyRepository.softDelete.calledOnceWithExactly({ uuid: apiKey.uuid })).toBe(true)
    expect(eventEmitter).toHaveEmitted(new ApiKeyDeletedEvent(apiKey.uuid))
    expect(apiKeyAuthCache.clear.calledOnceWithExactly(
      apiKey.secretHash
    )).toBe(true)
  })

  it('throws an error when a non-admin user tries to delete another user their api key', async () => {
    const apiKey = buildApiKey()
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    apiKeyRepository.findOneBy.resolves(apiKey)
    const principal: AuthPrincipal = {
      type: 'user',
      userUuid: generateUuid<UserUuid>(),
      userId: 'user-id'
    }
    const permissions = new PermissionSet([], false)

    const useCase = new DeleteApiKeyUseCase(
      stubDataSource(),
      apiKeyRepository,
      createStubInstance(DomainEventEmitter),
      createStubInstance(ApiKeyAuthCache)
    )

    await expect(useCase.execute(apiKey.uuid, principal, permissions))
      .rejects.toThrow(new ApiKeyNotFoundError(apiKey.uuid))
  })
})
