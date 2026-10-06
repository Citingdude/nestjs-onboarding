import { Module } from '@nestjs/common'
import { CreateContactModule } from './use-cases/create-contact/create-contact.module.js'
import { UpdateContactModule } from './use-cases/update-contact/update-contact.module.js'
import { DeleteContactModule } from './use-cases/delete-contact/delete-contact.module.js'
import { ExportContactsModule } from './use-cases/export-contacts/export-contacts.module.js'
import { ViewContactDetailModule } from './use-cases/view-contact-detail/view-contact-detail.module.js'
import { ViewContactIndexModule } from './use-cases/view-contact-index/view-contact-index.module.js'

@Module({
  imports: [
    CreateContactModule,
    UpdateContactModule,
    DeleteContactModule,
    ExportContactsModule,
    ViewContactDetailModule,
    ViewContactIndexModule
  ]
})
export class ContactModule { }
