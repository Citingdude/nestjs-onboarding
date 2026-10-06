import type { ServerResponse } from 'node:http'
import { Injectable, type NestMiddleware } from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { exhaustiveCheck } from '@wisemen/nestjs-common'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import {
  type DomainEventLogActor,
  DomainEventLogActorContext
} from '#src/modules/domain-event-log/modules/domain-event-log-actor-context/domain-event-log-actor.context.js'
import { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

@Injectable()
export class DomainEventLogActorMiddleware implements NestMiddleware {
  constructor (
    private authContext: AuthContext,
    private actorContext: DomainEventLogActorContext
  ) {}

  use (_req: FastifyRequest, _res: ServerResponse, next: () => void): void {
    this.actorContext.run(this.getActor(), next)
  }

  private getActor (): DomainEventLogActor {
    const auth = this.authContext.getAuth()

    if (auth === null) {
      return { actorType: null, actorId: null }
    } else if (auth.type === 'user') {
      return { actorType: DomainEventActorType.USER, actorId: auth.userUuid }
    } else if (auth.type === 'api-key') {
      return { actorType: DomainEventActorType.API_KEY, actorId: auth.apiKeyUuid }
    } else {
      exhaustiveCheck(auth)
    }
  }
}
