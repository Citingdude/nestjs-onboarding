import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'

export class ExportSucceededIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: ExportUuid

  constructor (uuid: ExportUuid) {
    this.uuid = uuid
  }
}

export class ExportSucceededIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'ExportSucceededIntegrationEventType',
    enum: [IntegrationEventType.EXPORT_SUCCEEDED]
  })
  declare type: IntegrationEventType.EXPORT_SUCCEEDED

  @ApiProperty({ type: ExportSucceededIntegrationEventContent })
  declare data: ExportSucceededIntegrationEventContent

  constructor (uuid: ExportUuid) {
    super({
      type: IntegrationEventType.EXPORT_SUCCEEDED,
      data: new ExportSucceededIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const ExportSucceededNatsSubject = 'project-template.{env}.user.{userUuid}.export.{exportUuid}.succeeded'
export const ExportSucceededChannel = createChannel(ExportSucceededNatsSubject, {
  parameters: {
    env: {
      enum: Object.values(EnvType),
      description: 'The environment from which the event originates',
      examples: [EnvType.DEVELOPMENT]
    },
    userUuid: {
      description: 'The uuid of the user who requested the export'
    },
    exportUuid: {
      description: 'The uuid of the export'
    }
  },
  operations: {
    sendContactCreated: {
      action: 'send',
      summary: 'this is message is sent when an export has succeeded',
      messages: [ExportSucceededIntegrationEvent]
    }
  }
})
