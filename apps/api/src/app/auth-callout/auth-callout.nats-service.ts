import type { ServiceMsg } from '@nats-io/services'
import dayjs from 'dayjs'
import { NatsAuthorizationRequestParser, NatsAuthorizationResponseBuilder, NatsMessage, NatsService, NatsServiceEndpoint, OnNatsMessage } from '@wisemen/nestjs-nats'
import { AuthCalloutPermissions } from './auth-callout-permissions.js'
import { Authenticator } from '#src/modules/auth/authentication/authenticator/authenticator.js'
import { AuthCalloutConfig } from '#src/app/auth-callout/auth-callout.config.js'
import { WebsocketNatsConnection } from '#src/modules/nats/connections/websocket.nats-connection.js'

@NatsService(() => ({
  name: 'auth',
  version: '0.0.1',
  description: 'Handle authentication for NATS auth callout',
  connection: WebsocketNatsConnection
}))
@NatsServiceEndpoint(() => ({
  name: 'auth-callout',
  subject: '$SYS.REQ.USER.AUTH',
  service: AuthCalloutNatsService
}))
export class AuthCalloutNatsService {
  // eslint-disable-next-line no-magic-numbers
  private static EXPIRES_IN_MINUTES = 5

  constructor (
    private config: AuthCalloutConfig,
    private requestParser: NatsAuthorizationRequestParser,
    private authenticator: Authenticator,
    private permissions: AuthCalloutPermissions
  ) {}

  @OnNatsMessage()
  async handleCallout (
    @NatsMessage() msg: ServiceMsg
  ): Promise<Uint8Array> {
    const parsedRequest = this.requestParser.parse(msg, this.config.xKey)
    const { authToken } = parsedRequest
    const auth = await this.authenticator.fromBearerToken(authToken)
    const permissions = await this.permissions.getPermissionsFor(auth)

    return await new NatsAuthorizationResponseBuilder()
      .withAudience(this.config.natsAudience)
      .withIssuerKeys(this.config.calloutIssuerKeys)
      .withRequest(parsedRequest)
      .withUserName(auth.userId)
      .withPublishPermissions(permissions.pub)
      .withSubPermissions(permissions.sub)
      .withExpiresAt(dayjs().add(AuthCalloutNatsService.EXPIRES_IN_MINUTES, 'minutes').toDate())
      .build()
  }
}
