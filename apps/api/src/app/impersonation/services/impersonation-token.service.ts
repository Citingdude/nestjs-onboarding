import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ImpersonationToken } from './impersonation-token.type.js'
import { ZitadelTokenExchangeFailedError } from '#src/app/impersonation/errors/zitadel-token-exchange-failed.error.js'

const TOKEN_ENDPOINT_PATH = '/oauth/v2/token'
const GRANT_TOKEN_EXCHANGE = 'urn:ietf:params:oauth:grant-type:token-exchange'
const TOKEN_TYPE_USER_ID = 'urn:zitadel:params:oauth:token-type:user_id'
const TOKEN_TYPE_ACCESS = 'urn:ietf:params:oauth:token-type:access_token'
const TOKEN_TYPE_JWT = 'urn:ietf:params:oauth:token-type:jwt'
const PROJECT_AUDIENCE_SCOPE = (projectId: string): string =>
  `openid urn:zitadel:iam:org:project:id:${projectId}:aud`

interface ZitadelTokenResponse {
  access_token: string
  expires_in: number
}

@Injectable()
export class ImpersonationTokenService {
  private readonly tokenEndpoint: string
  private readonly clientId: string
  private readonly clientSecret: string
  private readonly projectAudienceScope: string

  constructor (private readonly configService: ConfigService) {
    const baseUrl = this.configService.getOrThrow<string>('ZITADEL_BASE_URL')
    this.tokenEndpoint = new URL(TOKEN_ENDPOINT_PATH, baseUrl).toString()
    this.clientId = this.configService.getOrThrow<string>('ZITADEL_IMPERSONATION_CLIENT_ID')
    this.clientSecret = this.configService.getOrThrow<string>('ZITADEL_IMPERSONATION_CLIENT_SECRET')
    const projectId = this.configService.getOrThrow<string>('AUTH_PROJECT_ID')
    this.projectAudienceScope = PROJECT_AUDIENCE_SCOPE(projectId)
  }

  async exchangeToken (targetUserId: string): Promise<ImpersonationToken> {
    const actorToken = await this.getActorToken()

    const response = await this.postToken({
      grant_type: GRANT_TOKEN_EXCHANGE,
      scope: this.projectAudienceScope,
      subject_token: targetUserId,
      subject_token_type: TOKEN_TYPE_USER_ID,
      actor_token: actorToken,
      actor_token_type: TOKEN_TYPE_ACCESS,
      requested_token_type: TOKEN_TYPE_JWT
    })

    return { accessToken: response.access_token, expiresIn: response.expires_in }
  }

  private async getActorToken (): Promise<string> {
    const response = await this.postToken({
      grant_type: 'client_credentials',
      scope: this.projectAudienceScope
    })

    return response.access_token
  }

  private async postToken (params: Record<string, string>): Promise<ZitadelTokenResponse> {
    const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basic}`
      },
      body: new URLSearchParams(params).toString()
    })

    if (!response.ok) {
      throw new ZitadelTokenExchangeFailedError()
    }

    return await response.json() as ZitadelTokenResponse
  }
}
