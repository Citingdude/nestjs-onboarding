import { Transform, type TransformCallback } from 'node:stream'
import type { ExportContactRecord } from '#src/app/contact/use-cases/export-contacts/job/export-contacts-job.repository.js'
import { t } from '#src/modules/localization/helpers/translate.helper.js'
import type { Locale } from '#src/modules/localization/enums/locale.enum.js'

export class ExportContactsTransform extends Transform {
  constructor (
    private lang: Locale
  ) {
    super({ objectMode: true })
  }

  _transform (contact: ExportContactRecord, _encoding: string, callback: TransformCallback): void {
    this.push({
      [t('csv.contacts.uuid', { lang: this.lang })]: contact.uuid,
      [t('csv.contacts.first-name', { lang: this.lang })]: contact.firstName,
      [t('csv.contacts.last-name', { lang: this.lang })]: contact.lastName,
      [t('csv.contacts.email', { lang: this.lang })]: contact.email,
      [t('csv.contacts.phone', { lang: this.lang })]: contact.phone
    })
    callback()
  }
}
