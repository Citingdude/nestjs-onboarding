import type { Authenticator } from '@nats-io/transport-node'
import { credsAuthenticator, nkeyAuthenticator, usernamePasswordAuthenticator } from '@nats-io/transport-node'
import { exhaustiveCheck } from '@wisemen/nestjs-common'
import { NatsAuthMethod } from '#src/modules/nats/enums/nats-auth-method.enum.js'

type NatsAuthContent = {
  method: NatsAuthMethod
  secret: string
}

export function getNatsAuthenticator (authContent: NatsAuthContent): Authenticator {
  switch (authContent.method) {
    case NatsAuthMethod.USERNAME_PASSWORD: {
      const [username, password] = authContent.secret.split(',')
      return usernamePasswordAuthenticator(username, password)
    }
    case NatsAuthMethod.CREDS: {
      const creds = new TextEncoder().encode(Buffer.from(authContent.secret, 'base64').toString())
      return credsAuthenticator(creds)
    }
    case NatsAuthMethod.NKEY:
      return nkeyAuthenticator(new TextEncoder().encode(authContent.secret))
    default:
      exhaustiveCheck(authContent.method)
  }
}
