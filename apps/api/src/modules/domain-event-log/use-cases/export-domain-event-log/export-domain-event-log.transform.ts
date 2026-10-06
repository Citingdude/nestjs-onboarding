import { Transform, type TransformCallback } from 'node:stream'
import type { ExportDomainEventLogRecord } from './export-domain-event-log-job.repository.js'
import { t } from '#src/modules/localization/helpers/translate.helper.js'
import type { Locale } from '#src/modules/localization/enums/locale.enum.js'

export class ExportDomainEventLogTransform extends Transform {
  constructor (
    private readonly lang: Locale
  ) {
    super({ objectMode: true })
  }

  _transform (
    log: ExportDomainEventLogRecord,
    _encoding: string,
    callback: TransformCallback
  ): void {
    this.push({
      [t('csv.event-logs.uuid', { lang: this.lang })]: log.uuid,
      [t('csv.event-logs.created-at', { lang: this.lang })]: new Date(log.createdAt).toISOString(),
      [t('csv.event-logs.version', { lang: this.lang })]: String(log.version),
      [t('csv.event-logs.source', { lang: this.lang })]: log.source,
      [t('csv.event-logs.type', { lang: this.lang })]: log.type,
      [t('csv.event-logs.subject-type', { lang: this.lang })]: log.subjectType,
      [t('csv.event-logs.subject-id', { lang: this.lang })]: log.subjectId,
      [t('csv.event-logs.actor-type', { lang: this.lang })]: log.actorType,
      [t('csv.event-logs.actor-id', { lang: this.lang })]: log.actorId,
      [t('csv.event-logs.content', { lang: this.lang })]: JSON.stringify(log.content),
      [t('csv.event-logs.trace-id', { lang: this.lang })]: log.traceId
    })

    callback()
  }
}
