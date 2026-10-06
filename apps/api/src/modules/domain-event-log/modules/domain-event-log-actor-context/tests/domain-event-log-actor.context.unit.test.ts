import { describe, it } from 'node:test'
import { expect } from 'expect'
import { DomainEventLogActorContext } from '#src/modules/domain-event-log/modules/domain-event-log-actor-context/domain-event-log-actor.context.js'
import { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'

describe('DomainEventLogActorContext unit tests', () => {
  it('returns a null actor when unset', () => {
    const context = new DomainEventLogActorContext()

    expect(context.getActor()).toStrictEqual({ actorType: null, actorId: null })
  })

  it('returns the actor set for the current run', () => {
    const context = new DomainEventLogActorContext()
    const actor = { actorType: DomainEventActorType.USER, actorId: 'user-uuid' }

    context.run(actor, () => {
      expect(context.getActor()).toStrictEqual(actor)
    })
  })

  it('does not leak the actor outside of the run callback', () => {
    const context = new DomainEventLogActorContext()

    context.run({ actorType: DomainEventActorType.API_KEY, actorId: 'api-key-uuid' }, () => {})

    expect(context.getActor()).toStrictEqual({ actorType: null, actorId: null })
  })
})
