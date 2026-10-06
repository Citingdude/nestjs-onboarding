import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'

export class ContactDeletedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: ContactUuid

  constructor (uuid: ContactUuid) {
    this.uuid = uuid
  }
}

export class ContactDeletedIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'ContactDeletedIntegrationEventType',
    enum: [IntegrationEventType.CONTACT_DELETED]
  })
  declare type: IntegrationEventType.CONTACT_DELETED

  @ApiProperty({ type: ContactDeletedIntegrationEventContent })
  declare data: ContactDeletedIntegrationEventContent

  constructor (uuid: ContactUuid) {
    super({
      type: IntegrationEventType.CONTACT_DELETED,
      data: new ContactDeletedIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const ContactDeletedNatsSubject = 'project-template.{env}.contact.{uuid}.deleted'
export const ContactDeletedChannel = createChannel(ContactDeletedNatsSubject, {
  parameters: {
    env: {
      enum: Object.values(EnvType),
      description: 'The environment from which the event originates',
      examples: [EnvType.DEVELOPMENT]
    },
    uuid: {
      description: 'The uuid of the contact'
    }
  },
  operations: {
    sendContactDeleted: {
      action: 'send',
      summary: 'this is message is sent a contact is deleted',
      messages: [ContactDeletedIntegrationEvent]
    }
  }
})
