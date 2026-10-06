import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NatsClientModule } from '@wisemen/nestjs-nats'
import type { NatsAuthMethod } from '#src/modules/nats/enums/nats-auth-method.enum.js'
import { getNatsAuthenticator } from '#src/modules/nats/helpers/get-nats-authenticator.helper.js'

@Module({
  imports: [
    NatsClientModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const method = cfg.get<NatsAuthMethod>('NATS_WEBSOCKET_AUTH_METHOD')
        const secret = cfg.get<string>('NATS_WEBSOCKET_AUTH_SECRET')

        return {
          client: {
            servers: cfg.get<string>('NATS_WEBSOCKET_ENDPOINT'),
            maxReconnectAttempts: -1,
            authenticator: (method != null && secret != null)
              ? getNatsAuthenticator({ method, secret })
              : undefined
          }
        }
      }
    })
  ],
  exports: [NatsClientModule]
})
export class DefaultNatsClientModule {}
