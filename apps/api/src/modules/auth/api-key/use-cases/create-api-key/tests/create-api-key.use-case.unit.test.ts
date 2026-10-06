import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { timestamp } from '@wisemen/datewise'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { CreateApiKeyCommandBuilder } from '#src/modules/auth/api-key/use-cases/create-api-key/create-api-key.command.builder.js'
import { CreateApiKeyUseCase } from '#src/modules/auth/api-key/use-cases/create-api-key/create-api-key.use-case.js'
import { ApiKeyCreatedEvent } from '#src/modules/auth/api-key/use-cases/create-api-key/api-key-created.event.js'
import { ApiKeyInvalidExpiresAtError } from '#src/modules/auth/api-key/errors/api-key-invalid-expires-at.error.js'
import { ApiKeyInvalidPermissionsError } from '#src/modules/auth/api-key/errors/api-key-invalid-permissions.error.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { ApiKeySecret } from '#src/modules/auth/api-key/api-key-secret.js'
import { PermissionSet } from '#src/modules/auth/permission/permission-set.js'

function buildApiKey (createdByUserUuid: UserUuid): ApiKey {
  const apiKey = new ApiKey()
  apiKey.uuid = generateUuid()
  apiKey.createdAt = timestamp().toDate()
  apiKey.deletedAt = null
  apiKey.expiresAt = timestamp().add(1, 'month').toDate()
  apiKey.name = 'Primary integration key'
  apiKey.permissions = [Permission.CONTACT_READ]
  apiKey.secretHash = 'secret-hash'
  apiKey.secretLastChars
    = apiKey.userUuid = createdByUserUuid
  apiKey.user = new UserBuilder()
    .withUuid(createdByUserUuid)
    .withEmail('creator@wisemen.test')
    .build()

  return apiKey
}

describe('CreateApiKeyUseCase unit tests', () => {
  before(() => TestBench.setupUnitTest())

  it('throws an error when expiresAt is in the past', async () => {
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    const useCase = new CreateApiKeyUseCase(
      stubDataSource(),
      apiKeyRepository,
      createStubInstance(DomainEventEmitter)
    )

    const command = new CreateApiKeyCommandBuilder()
      .withExpiresAt('2020-01-01T00:00:00.000Z')
      .build()

    const userUuid = generateUuid<UserUuid>()
    const userPermissions = new PermissionSet([], false)

    await expect(useCase.execute(command, userUuid, userPermissions))
      .rejects.toThrow(new ApiKeyInvalidExpiresAtError())
  })

  it('throws an error when disallowed permissions are requested', async () => {
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)

    const useCase = new CreateApiKeyUseCase(
      stubDataSource(),
      apiKeyRepository,
      createStubInstance(DomainEventEmitter)
    )

    const command = new CreateApiKeyCommandBuilder()
      .withPermissions([Permission.API_KEY_READ])
      .build()

    const userUuid = generateUuid<UserUuid>()
    const userPermissions = new PermissionSet([], false)

    await expect(useCase.execute(command, userUuid, userPermissions))
      .rejects.toThrow(new ApiKeyInvalidPermissionsError())
  })

  it('throws an error when the creator does not own all requested permissions', async () => {
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)

    const useCase = new CreateApiKeyUseCase(
      stubDataSource(),
      apiKeyRepository,
      createStubInstance(DomainEventEmitter)
    )

    const command = new CreateApiKeyCommandBuilder()
      .withPermissions([Permission.USER_READ])
      .build()

    const userUuid = generateUuid<UserUuid>()
    const userPermissions = new PermissionSet([Permission.CONTACT_READ], false)

    await expect(useCase.execute(command, userUuid, userPermissions))
      .rejects.toThrow(new ApiKeyInvalidPermissionsError())
  })

  it('inserts the api key, emits an event, and returns the created response', async () => {
    const userUuid = generateUuid<UserUuid>()
    const eventEmitter = createStubInstance(DomainEventEmitter)

    const createdApiKey = buildApiKey(userUuid)
    const apiKeyRepository = createStubInstance(TypeOrmRepository<ApiKey>)
    apiKeyRepository.create.callsFake(function (value: Partial<ApiKey>): ApiKey {
      return Object.assign(buildApiKey(userUuid), value)
    })
    apiKeyRepository.findOneOrFail.resolves(createdApiKey)

    const userPermissions = new PermissionSet([
      Permission.API_KEY_CREATE,
      Permission.CONTACT_READ
    ], false)

    const useCase = new CreateApiKeyUseCase(
      stubDataSource(),
      apiKeyRepository,
      eventEmitter
    )

    const expiresAt = timestamp().add(1, 'month').toISOString()
    const command = new CreateApiKeyCommandBuilder()
      .withName('Primary integration key  ')
      .withPermissions([Permission.CONTACT_READ])
      .withExpiresAt(expiresAt)
      .build()

    const response = await useCase.execute(command, userUuid, userPermissions)
    const insertedApiKey = apiKeyRepository.insert.getCall(0)?.args[0] as ApiKey

    expect(apiKeyRepository.insert.calledOnce).toBe(true)
    expect(insertedApiKey.name).toBe('Primary integration key')
    expect(insertedApiKey.userUuid).toBe(userUuid)
    expect(insertedApiKey.permissions).toEqual([Permission.CONTACT_READ])
    expect(insertedApiKey.expiresAt?.toISOString()).toBe(expiresAt)

    expect(eventEmitter).toHaveEmitted(new ApiKeyCreatedEvent(insertedApiKey.uuid))

    expect(response).toEqual(expect.objectContaining({
      uuid: createdApiKey.uuid,
      name: createdApiKey.name,
      permissions: createdApiKey.permissions,
      userUuid: userUuid,
      userEmail: 'creator@wisemen.test',
      maskedKey: ApiKeySecret.mask(response.apiKey),
      expiresAt: createdApiKey.expiresAt!.toISOString(),
      createdAt: createdApiKey.createdAt.toISOString()
    }))
    expect(response.apiKey.startsWith('ak_')).toBe(true)
  })
})
