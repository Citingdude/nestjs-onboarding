import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { ApiKeyDeletedEvent } from './api-key-deleted.event.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'
import type { ApiKeyUuid } from '#src/modules/auth/api-key/entities/api-key.uuid.js'
import { ApiKeyNotFoundError } from '#src/modules/auth/api-key/errors/api-key.not-found.error.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'
import { ApiKeyAuthCache } from '#src/modules/auth/api-key/authenticator/cache/api-key-auth-cache.js'
import type { PermissionSet } from '#src/modules/auth/permission/permission-set.js'

@Injectable()
export class DeleteApiKeyUseCase {
  constructor (
    private dataSource: DataSource,
    @InjectRepository(ApiKey)
    private apiKeyRepository: TypeOrmRepository<ApiKey>,
    private emitter: DomainEventEmitter,
    private apiKeyAuthCache: ApiKeyAuthCache
  ) { }

  async execute (uuid: ApiKeyUuid, auth: AuthPrincipal, permissions: PermissionSet): Promise<void> {
    const apiKey = await this.apiKeyRepository.findOneBy({ uuid })

    if (apiKey == null) {
      throw new ApiKeyNotFoundError(uuid)
    }

    const canDeleteOthers = permissions.hasAny([Permission.API_KEY_DELETE])

    if ((!canDeleteOthers && apiKey.userUuid !== auth.userUuid)) {
      throw new ApiKeyNotFoundError(uuid)
    }

    await transaction(this.dataSource, async () => {
      await this.apiKeyRepository.softDelete({ uuid })
      await this.emitter.emitOne(new ApiKeyDeletedEvent(uuid))
    })

    await this.apiKeyAuthCache.clear(apiKey.secretHash)
  }
}
