import { AsyncLocalStorage } from 'async_hooks'
import { Injectable } from '@nestjs/common'
import type { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

export interface DomainEventLogActor {
  actorType: DomainEventActorType | null
  actorId: string | null
}

const NO_ACTOR: DomainEventLogActor = { actorType: null, actorId: null }

@Injectable()
export class DomainEventLogActorContext {
  private actorStorage = new AsyncLocalStorage<DomainEventLogActor>()

  getActor (): DomainEventLogActor {
    return this.actorStorage.getStore() ?? NO_ACTOR
  }

  run (actor: DomainEventLogActor, callback: () => void): void {
    this.actorStorage.run(actor, callback)
  }
}
