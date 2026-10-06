import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import type { AuthenticatedApiKey } from '#src/modules/auth/authentication/auth-principal.type.js'
import { InvalidOrExpiredApiKeyError } from '#src/modules/auth/api-key/authenticator/invalid-or-expired-api-key.error.js'
import { ApiKeySecret } from '#src/modules/auth/api-key/api-key-secret.js'
import { ApiKeyAuthCache } from '#src/modules/auth/api-key/authenticator/cache/api-key-auth-cache.js'
import { ApiKey } from '#src/modules/auth/api-key/entities/api-key.entity.js'

@Injectable()
export class ApiKeyAuthenticator {
  constructor (
    @InjectRepository(ApiKey)
    private repository: TypeOrmRepository<ApiKey>,
    private cache: ApiKeyAuthCache
  ) {}

  async authenticate (token: string): Promise<AuthenticatedApiKey> {
    const secret = new ApiKeySecret(token)
    const cachedApiKey = await this.cache.get(secret)

    if (cachedApiKey != null) {
      return cachedApiKey
    }

    const authorizedApiKey = await this.fetchApiKey(secret)
    await this.cache.set(secret, authorizedApiKey)

    return authorizedApiKey
  }

  private async fetchApiKey (secret: ApiKeySecret): Promise<AuthenticatedApiKey> {
    const apiKey = await this.repository.findOne({
      where: { secretHash: secret.hash },
      relations: { user: true }
    })

    if (apiKey == null || apiKey.deletedAt != null || this.isExpired(apiKey.expiresAt)) {
      throw new InvalidOrExpiredApiKeyError()
    }

    return {
      type: 'api-key',
      apiKeyUuid: apiKey.uuid,
      permissions: apiKey.permissions,
      userUuid: apiKey.userUuid,
      userId: apiKey.user!.userId
    }
  }

  private isExpired (expiresAt: Date | null): boolean {
    return expiresAt != null && expiresAt < new Date()
  }
}
