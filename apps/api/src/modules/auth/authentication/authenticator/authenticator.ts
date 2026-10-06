import { Injectable } from '@nestjs/common'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'
import { InvalidAuthorizationHeaderFormatError } from '#src/modules/auth/authentication/authenticator/invalid-authorization-header-format.error.js'
import { NoAuthorizationHeaderError } from '#src/modules/auth/authentication/authenticator/no-authorization-header.error.js'
import { API_KEY_PREFIX } from '#src/modules/auth/api-key/api-key-secret.js'
import { ApiKeyAuthenticator } from '#src/modules/auth/api-key/authenticator/api-key-authenticator.js'
import { UserAuthenticator } from '#src/modules/auth/users/authenticator/user-authenticator.js'

@Injectable()
export class Authenticator {
  constructor (
    private userTokenAuthService: UserAuthenticator,
    private apiKeyAuthService: ApiKeyAuthenticator
  ) {}

  async authenticate (authorizationHeader?: string): Promise<AuthPrincipal> {
    if (authorizationHeader == null) {
      throw new NoAuthorizationHeaderError()
    }

    const token = this.extractBearerToken(authorizationHeader)

    if (token == null) {
      throw new InvalidAuthorizationHeaderFormatError()
    }

    return await this.fromBearerToken(token)
  }

  async fromBearerToken (token: string): Promise<AuthPrincipal> {
    if (token.startsWith(API_KEY_PREFIX)) {
      return await this.apiKeyAuthService.authenticate(token)
    }

    return await this.userTokenAuthService.authenticate(token)
  }

  private extractBearerToken (authorization?: string): string | null {
    if (authorization == null) {
      return null
    }

    const match = authorization.match(/^Bearer\s+(.+)$/i)

    if (match == null) {
      return null
    }

    const token = match[1].trim()

    return token.length > 0 ? token : null
  }
}
