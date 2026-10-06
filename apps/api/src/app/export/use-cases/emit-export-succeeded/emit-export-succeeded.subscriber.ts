import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NatsPublisher, natsSubject, type NatsPublisherStreamEventWithSubject } from '@wisemen/nestjs-nats'
import { Subscribe } from '@wisemen/nestjs-domain-events'
import { ExportSucceededEvent } from '#src/app/export/events/export-succeeded.event.js'
import { ExportSucceededIntegrationEvent, ExportSucceededNatsSubject } from '#src/app/export/use-cases/emit-export-succeeded/export-succeeded.integration.event.js'

@Injectable()
export class EmitExportSucceededSubscriber {
  constructor (
    private publisher: NatsPublisher,
    private config: ConfigService
  ) { }

  @Subscribe(ExportSucceededEvent)
  async onCompleted (events: ExportSucceededEvent[]) {
    const integrationEvents: NatsPublisherStreamEventWithSubject[] = []

    for (const event of events) {
      const exportUuid = event.content.exportUuid
      const integrationEvent = new ExportSucceededIntegrationEvent(exportUuid)
      const onSubject = natsSubject(ExportSucceededNatsSubject, {
        env: this.config.getOrThrow('NODE_ENV'),
        exportUuid: exportUuid,
        userUuid: event.content.requestedByUserUuid
      })
      integrationEvents.push({ event: integrationEvent, onSubject })
    }

    await this.publisher.publishToStream(integrationEvents)
  }
}
