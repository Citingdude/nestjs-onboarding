import { before, describe, it } from 'node:test'
import { assert, createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { ContactNotFoundError } from '#src/app/contact/errors/contact.not-found.error.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { ContactUpdatedEvent } from '#src/app/contact/use-cases/update-contact/contact-updated.event.js'
import { UpdateContactCommandBuilder } from '#src/app/contact/use-cases/update-contact/update-contact.command.builder.js'
import { UpdateContactUseCase } from '#src/app/contact/use-cases/update-contact/update-contact.use-case.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'
import { UpdateContactRepository } from '#src/app/contact/use-cases/update-contact/update-contact.repository.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

describe('UpdateContactUseCase Unit test', () => {
  before(() => {
    TestBench.setupUnitTest()
  })

  it('throws an error when the contact does not exist', async () => {
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

  it('throws an error when the file does not exist', async () => {
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

  it('throws an error when the avatar does not exist', async () => {
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

  it('emits a contact updated event', async () => {
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

  it('lowercases the email before updating the contact', async () => {
    const contact = new ContactBuilder().withEmail('before@example.com').build()
    const contactRepo = createStubInstance(UpdateContactRepository)
    contactRepo.findContact.resolves(contact)

    const useCase = new UpdateContactUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      contactRepo
    )

    const command = new UpdateContactCommandBuilder()
      .withEmail('John.Doe@Example.COM')
      .build()
    const contactUuid = generateUuid<ContactUuid>()

    await useCase.execute(contactUuid, command)

    assert.calledWithMatch(contactRepo.updateContact, { email: 'john.doe@example.com' })
  })
})
