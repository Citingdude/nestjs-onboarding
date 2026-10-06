import { fromSeed, type KeyPair } from '@nats-io/nkeys'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AuthCalloutConfig {
  private readonly _issuer: KeyPair | undefined
  private readonly _audience: string | undefined
  private readonly _xKey: KeyPair | undefined

  constructor (private readonly configService: ConfigService) {
    const issuerKey = this.configService.get<string>('NATS_WEBSOCKET_AUTH_CALLOUT_ISSUER_KEY')
    if (issuerKey !== undefined) {
      this._issuer = fromSeed(new TextEncoder().encode(issuerKey))
    }

    const xKey = this.configService.get<string>('NATS_AUTH_CALLOUT_XKEY')
    if (xKey !== undefined) {
      this._xKey = fromSeed(new TextEncoder().encode(xKey))
    }

    this._audience = this.configService.get<string>('NATS_WEBSOCKET_AUTH_CALLOUT_AUDIENCE')
  }

  get calloutIssuerKeys (): KeyPair {
    if (this._issuer === undefined) {
      throw new Error('No auth callout issuer keys set')
    }

    return this._issuer
  }

  get natsAudience (): string {
    if (this._audience === undefined) {
      throw new Error('No auth callout audience set')
    }

    return this._audience
  }

  get xKey (): KeyPair | undefined {
    return this._xKey
  }
}
