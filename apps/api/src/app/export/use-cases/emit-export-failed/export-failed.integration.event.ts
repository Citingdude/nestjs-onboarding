import { ApiProperty } from '@nestjs/swagger'
import { createChannel } from '@wisemen/nestjs-async-api'
import { IntegrationEvent } from '#src/modules/integration-events/integration-event.js'
import { IntegrationEventType } from '#src/modules/integration-events/integration-event.type.js'
import { EnvType } from '#src/modules/config/env.enum.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'

export class ExportFailedIntegrationEventContent {
  @ApiProperty({ type: 'string', format: 'uuid' })
  uuid: ExportUuid

  constructor (uuid: ExportUuid) {
    this.uuid = uuid
  }
}

export class ExportFailedIntegrationEvent extends IntegrationEvent {
  @ApiProperty({
    enumName: 'ExportFailedIntegrationEventType',
    enum: [IntegrationEventType.EXPORT_FAILED]
  })
  declare type: IntegrationEventType.EXPORT_FAILED

  @ApiProperty({ type: ExportFailedIntegrationEventContent })
  declare data: ExportFailedIntegrationEventContent

  constructor (uuid: ExportUuid) {
    super({
      type: IntegrationEventType.EXPORT_FAILED,
      data: new ExportFailedIntegrationEventContent(uuid),
      version: '0.0.1'
    })
  }
}

export const ExportFailedNatsSubject = 'project-template.{env}.user.{userUuid}.export.{exportUuid}.failed'
export const ExportFailedChannel = createChannel(ExportFailedNatsSubject, {
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
    sendExportFailed: {
      action: 'send',
      summary: 'this message is sent when an export has failed',
      messages: [ExportFailedIntegrationEvent]
    }
  }
})
