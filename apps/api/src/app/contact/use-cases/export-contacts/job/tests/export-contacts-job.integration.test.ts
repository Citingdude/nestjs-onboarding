import { after, afterEach, before, describe, it } from 'node:test'
import { expect } from 'expect'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { Contact } from '#src/app/contact/entities/contact.entity.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import { ExportContactsJobHandler } from '#src/app/contact/use-cases/export-contacts/job/export-contacts.job-handler.js'
import { ExportContactsJob } from '#src/app/contact/use-cases/export-contacts/job/export-contacts.job.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import { SystemQueueModule } from '#src/modules/queue-modules/system-queue.module.js'
import { Export } from '#src/app/export/entities/export.entity.js'
import { ExportStatus } from '#src/app/export/entities/export-status.enum.js'
import { ExportType } from '#src/app/export/entities/export-type.enum.js'
import { ExportBuilder } from '#src/app/export/entities/export.entity.builder.js'

describe('Export contacts job integration test', () => {
  let setup: TestSetup
  let handler: ExportContactsJobHandler
  let user: User

  before(async () => {
    setup = await TestBench.setupModuleTest(SystemQueueModule)

    handler = setup.app.get(ExportContactsJobHandler, { strict: false })

    user = new UserBuilder().build()
    await setup.entityManager.insert(User, user)
  })

  async function createExport (): Promise<Export> {
    const entity = new ExportBuilder()
      .withStatus(ExportStatus.CREATED)
      .withType(ExportType.CONTACT_CSV)
      .withRequestedByUserUuid(user.uuid)
      .build()

    await setup.entityManager.insert(Export, entity)
    return entity
  }

  afterEach(async () => {
    await setup.entityManager.clear(Contact)
  })

  after(async () => {
    await setup.teardown()
  })

  it('runs the export flow and marks the export as succeeded', async () => {
    const contactA = new ContactBuilder()
      .withFirstName('Alice')
      .withLastName('Smith')
      .withEmail('alice@example.com')
      .withPhone('+32470000001')
      .build()

    const contactB = new ContactBuilder()
      .withFirstName('Bob')
      .withLastName('Jones')
      .withEmail('bob@example.com')
      .withPhone('+32470000002')
      .build()

    await setup.entityManager.insert(Contact, [contactA, contactB])

    const exportRecord = await createExport()

    const job = new ExportContactsJob({
      requestedByUserUuid: user.uuid,
      exportUuid: exportRecord.uuid
    })

    await handler.run(job.data)

    const updatedExport = await setup.entityManager.findOneByOrFail(Export, {
      uuid: exportRecord.uuid
    })

    expect(updatedExport.status).toBe(ExportStatus.SUCCEEDED)
    expect(updatedExport.fileUuid).not.toBeNull()
  })
})
