## Unit test example shape

Use when testing a single use-case or service with stubs:

```ts
import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { ContactNotFoundError } from '#src/app/contact/errors/contact.not-found.error.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { ContactUpdatedEvent } from '#src/app/contact/use-cases/update-contact/contact-updated.event.js'
import { UpdateContactCommandBuilder } from '#src/app/contact/use-cases/update-contact/update-contact.command.builder.js'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { UpdateContactUseCase } from '#src/app/contact/use-cases/update-contact/update-contact.use-case.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { UpdateContactRepository } from '#src/app/contact/use-cases/update-contact/update-contact.repository.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import { generateUuid } from '@wisemen/nestjs-common'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

describe('UpdateContactUseCase Unit test', () => {
  before(() => {
    TestBench.setupUnitTest()
  })

  it('when the contact does not exist, an error is thrown', async () => {
    const contactRepo = createStubInstance(UpdateContactRepository)

    contactRepo.findContact.resolves(null)

    const useCase = new UpdateContactUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      contactRepo
    )

    const command = new UpdateContactCommandBuilder().build()

    const contactUuid = generateUuid<ContactUuid>()

    await expect(useCase.execute(contactUuid, command))
      .rejects.toThrow(new ContactNotFoundError(contactUuid))
  })

  it('when the file does not exist, an error is thrown', async () => {
    const contactRepo = createStubInstance(UpdateContactRepository)
    contactRepo.findContact.resolves(new ContactBuilder().build())
    contactRepo.fileExists.resolves(false)

    const useCase = new UpdateContactUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      contactRepo
    )

    const contactUuid = generateUuid<ContactUuid>()
    const fileUuid = generateUuid<FileUuid>()

    const command = new UpdateContactCommandBuilder()
      .withFileUuid(fileUuid)
      .build()

    await expect(useCase.execute(contactUuid, command))
      .rejects.toThrow(new FileNotFoundError(fileUuid))
  })

  it('when the avatar does not exist, an error is thrown', async () => {
    const contactRepo = createStubInstance(UpdateContactRepository)
    contactRepo.findContact.resolves(new ContactBuilder().build())
    contactRepo.fileExists.resolves(false)

    const useCase = new UpdateContactUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      contactRepo
    )

    const contactUuid = generateUuid<ContactUuid>()
    const avatarUuid = generateUuid<FileUuid>()

    const command = new UpdateContactCommandBuilder()
      .withAvatarUuid(avatarUuid)
      .build()

    await expect(useCase.execute(contactUuid, command))
      .rejects.toThrow(new FileNotFoundError(avatarUuid))
  })

  it('when a contact is updated, a contact updated event is emitted', async () => {
    const contactRepo = createStubInstance(UpdateContactRepository)
    contactRepo.findContact.resolves(new ContactBuilder().build())
    contactRepo.fileExists.resolves(true)

    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new UpdateContactUseCase(
      stubDataSource(),
      eventEmitter,
      contactRepo
    )

    const command = new UpdateContactCommandBuilder().build()
    const contactUuid = generateUuid<ContactUuid>()

    await useCase.execute(contactUuid, command)

    expect(eventEmitter).toHaveEmitted(new ContactUpdatedEvent(contactUuid))
  })
})
```