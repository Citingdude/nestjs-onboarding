import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NatsPublisher, natsSubject, type NatsPublisherStreamEventWithSubject } from '@wisemen/nestjs-nats'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { ExportFailedEvent } from '#src/app/export/events/export-failed.event.js'
import { ExportFailedIntegrationEvent, ExportFailedNatsSubject } from '#src/app/export/use-cases/emit-export-failed/export-failed.integration.event.js'

@Injectable()
export class EmitExportFailedSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) { }

  @Subscribe(ExportFailedEvent)
  async onFailed (events: ExportFailedEvent[]) {
    const integrationEvents: NatsPublisherStreamEventWithSubject[] = []

    for (const event of events) {
      const exportUuid = event.content.exportUuid
      const integrationEvent = new ExportFailedIntegrationEvent(exportUuid)
      const onSubject = natsSubject(ExportFailedNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        exportUuid: exportUuid,
        userUuid: event.content.requestedByUserUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publishToStream(integrationEvents)
  }
}
