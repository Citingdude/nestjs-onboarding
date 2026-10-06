import type { ServerResponse } from 'node:http'
import { Injectable, type NestMiddleware } from '@nestjs/common'
import { NestjsOtelLogger } from '@wisemen/opentelemetry'
import type { FastifyRequest } from 'fastify'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

const ANONYMOUS_ACTOR_TYPE = 'anonymous'

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor (
    private authContext: AuthContext,
    private logger: NestjsOtelLogger
  ) {}

  use (req: FastifyRequest, res: ServerResponse, next: () => void): void {
    const rawUrl = req.originalUrl ?? req.url ?? ''
    const path = rawUrl.split('?')[0]

    const attributes = {
      'audit.event_name': 'api.access',
      ...this.getActorAttributes(),
      'method': req.method,
      'path': path,
      'query': req.query,
      'client.address': req.ip,
      'user_agent.original': req.headers['user-agent']
    }

    res.once('finish', () => {
      this.logger.log(`API access: ${res.statusCode} ${req.method} ${attributes.path}`, 'AUDIT', {
        ...attributes,
        status_code: res.statusCode
      })
    })

    next()
  }

  private getActorAttributes (): Record<string, string> {
    const auth = this.authContext.getAuth()

    if (auth === null) {
      return { 'actor.type': ANONYMOUS_ACTOR_TYPE }
    }

    const attributes: Record<string, string> = {
      'actor.id': auth.userId,
      'actor.type': auth.type
    }

    if (auth.type === 'api-key') {
      attributes['actor.api_key_uuid'] = auth.apiKeyUuid
    }

    return attributes
  }
}
