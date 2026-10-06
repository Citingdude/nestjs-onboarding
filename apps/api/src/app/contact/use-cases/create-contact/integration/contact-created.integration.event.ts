import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'

export class ContactCreatedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: ContactUuid

  constructor (uuid: ContactUuid) {
    this.uuid = uuid
  }
}

export class ContactCreatedIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'ContactCreatedIntegrationEventType',
    enum: [IntegrationEventType.CONTACT_CREATED]
  })
  declare type: IntegrationEventType.CONTACT_CREATED

  @ApiProperty({ type: ContactCreatedIntegrationEventContent })
  declare data: ContactCreatedIntegrationEventContent

  constructor (uuid: ContactUuid) {
    super({
      type: IntegrationEventType.CONTACT_CREATED,
      data: new ContactCreatedIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const ContactCreatedNatsSubject = 'project-template.{env}.contact.{uuid}.created'
export const ContactCreatedChannel = createChannel(ContactCreatedNatsSubject, {
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
    sendContactCreated: {
      action: 'send',
      summary: 'this is message is sent a new contact is created',
      messages: [ContactCreatedIntegrationEvent]
    }
  }
})
