import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { parseEnvList } from '@wisemen/nestjs-common'

const BASE_SCOPES = ['openid', 'profile', 'email', 'offline_access']

@Injectable()
export class McpOAuthConfig {
  readonly issuer: string
  readonly scopesSupported: string[]

  constructor (configService: ConfigService) {
    this.issuer = configService.getOrThrow<string>('AUTH_ISSUER')

    const additionalScopes = parseEnvList(configService.get<string>('OPEN_API_SCOPES'))
      .map(entry => entry.split(' ')[0])
      .filter(scope => scope != null && scope.length > 0)

    this.scopesSupported = [...new Set([...BASE_SCOPES, ...additionalScopes])]
  }
}
