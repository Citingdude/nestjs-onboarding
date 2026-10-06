import { NatsConnection } from '@wisemen/nestjs-nats'
import type { NatsAuthMethod } from '#src/modules/nats/enums/nats-auth-method.enum.js'
import { getNatsAuthenticator } from '#src/modules/nats/helpers/get-nats-authenticator.helper.js'

@NatsConnection((config) => {
  const method = config.getOrThrow<NatsAuthMethod>('NATS_WEBSOCKET_AUTH_METHOD')
  const secret = config.getOrThrow<string>('NATS_WEBSOCKET_AUTH_SECRET')
  return {
    name: 'auth-callout-client',
    servers: config.getOrThrow<string>('NATS_WEBSOCKET_ENDPOINT'),
    authenticator: getNatsAuthenticator({ method, secret })
  }
})
export class WebsocketNatsConnection {}
