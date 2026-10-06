import dayjs from 'dayjs'
import { DataSource } from 'typeorm'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { Injectable } from '@nestjs/common'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { CreateApiKeyCommand } from './create-api-key.command.js'
import { CreateApiKeyResponse } from './create-api-key.response.js'
import { ApiKeyCreatedEvent } from './api-key-created.event.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import { ApiKeyInvalidPermissionsError } from '#src/modules/auth/api-key/errors/api-key-invalid-permissions.error.js'
import { ApiKeyInvalidExpiresAtError } from '#src/modules/auth/api-key/errors/api-key-invalid-expires-at.error.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { ApiKeySecret } from '#src/modules/auth/api-key/api-key-secret.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { PermissionSet } from '#src/modules/auth/permission/permission-set.js'

@Injectable()
export class CreateApiKeyUseCase {
  private static DISALLOWED_API_KEY_PERMISSIONS = new Set<Permission>([
    Permission.ALL_PERMISSIONS,
    Permission.API_KEY_READ,
    Permission.API_KEY_READ_OWN,
    Permission.API_KEY_CREATE,
    Permission.API_KEY_DELETE,
    Permission.API_KEY_DELETE_OWN
  ])

  constructor (
    private dataSource: DataSource,
    @InjectRepository(ApiKey)
    private apiKeyRepository: TypeOrmRepository<ApiKey>,
    private emitter: DomainEventEmitter
  ) { }

  async execute (
    command: CreateApiKeyCommand,
    userUuid: UserUuid,
    userPermissions: PermissionSet
  ): Promise<CreateApiKeyResponse> {
    if (command.expiresAt != null && dayjs(command.expiresAt).isBefore(dayjs())) {
      throw new ApiKeyInvalidExpiresAtError()
    }

    if (!this.areValidApiKeyPermissions(command.permissions)) {
      throw new ApiKeyInvalidPermissionsError()
    }

    if (!userPermissions.hasAll(command.permissions)) {
      throw new ApiKeyInvalidPermissionsError()
    }

    const secret = new ApiKeySecret()
    const apiKey = this.apiKeyRepository.create({
      name: command.name.trim(),
      userUuid: userUuid,
      permissions: command.permissions,
      secretHash: secret.hash,
      secretLastChars: secret.lastChars,
      expiresAt: command.expiresAt != null ? new Date(command.expiresAt) : null,
      deletedAt: null
    })

    await transaction(this.dataSource, async () => {
      await this.apiKeyRepository.insert(apiKey)
      await this.emitter.emitOne(new ApiKeyCreatedEvent(apiKey.uuid))
    })

    const createdApiKey = await this.apiKeyRepository.findOneOrFail({
      where: { uuid: apiKey.uuid },
      relations: { user: true }
    })

    return new CreateApiKeyResponse(createdApiKey, secret)
  }

  private areValidApiKeyPermissions (permissions: Permission[]): boolean {
    return permissions.every(p => !CreateApiKeyUseCase.DISALLOWED_API_KEY_PERMISSIONS.has(p))
  }
}
