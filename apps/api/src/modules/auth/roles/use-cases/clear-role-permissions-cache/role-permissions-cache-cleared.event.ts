import { DomainEvent, RegisterDomainEvent } from '@wisemen/nestjs-domain-events'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'

export class RolePermissionsCacheClearedEventContent {
  constructor (readonly roleUuids: string[]) {}
}

@RegisterDomainEvent(DomainEventType.ROLE_PERMISSIONS_CACHE_CLEARED, 1)
export class RolePermissionsCacheClearedEvent
  extends DomainEvent<RolePermissionsCacheClearedEventContent> {
  constructor (roleUuids: string[]) {
    super({
      content: new RolePermissionsCacheClearedEventContent(roleUuids)
    })
  }
}
