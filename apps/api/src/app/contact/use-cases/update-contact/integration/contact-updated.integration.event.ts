import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'

export class ContactUpdatedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: ContactUuid

  constructor (uuid: ContactUuid) {
    this.uuid = uuid
  }
}

export class ContactUpdatedIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'ContactUpdatedIntegrationEventType',
    enum: [IntegrationEventType.CONTACT_UPDATED]
  })
  declare type: IntegrationEventType.CONTACT_UPDATED

  @ApiProperty({ type: ContactUpdatedIntegrationEventContent })
  declare data: ContactUpdatedIntegrationEventContent

  constructor (uuid: ContactUuid) {
    super({
      type: IntegrationEventType.CONTACT_UPDATED,
      data: new ContactUpdatedIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const ContactUpdatedNatsSubject = 'project-template.{env}.contact.{uuid}.updated'
export const ContactUpdatedChannel = createChannel(ContactUpdatedNatsSubject, {
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
    sendContactUpdated: {
      action: 'send',
      summary: 'this is message is sent a contact is updated',
      messages: [ContactUpdatedIntegrationEvent]
    }
  }
})
