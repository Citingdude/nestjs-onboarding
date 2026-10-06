import { RegisterDomainEvent, DomainEvent } from '@wisemen/nestjs-domain-events'
import { NotificationPreset } from '#src/modules/notification/enums/notification-preset.enum.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class NotificationPreferencePresetEventContent {
  constructor (readonly userUuid: UserUuid, readonly preset: NotificationPreset) {}
}

@RegisterDomainEvent(DomainEventType.NOTIFICATION_PREFERENCE_PRESET_UPDATED, 1)
export class NotificationPreferencePresetUpdatedEvent extends DomainEvent {
  constructor (userUuid: UserUuid, preset: NotificationPreset) {
    super({
      content: new NotificationPreferencePresetEventContent(userUuid, preset)
    })
  }
}
