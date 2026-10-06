import { before, describe, it } from 'node:test'
import { assert, createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { CreateContactCommandBuilder } from '#src/app/contact/use-cases/create-contact/create-contact.command.builder.js'
import { CreateContactUseCase } from '#src/app/contact/use-cases/create-contact/create-contact.use-case.js'
import { ContactBuilder } from '#src/app/contact/entities/contact.entity.builder.js'
import { ContactCreatedEvent } from '#src/app/contact/use-cases/create-contact/contact-created.event.js'
import { FileNotFoundError } from '#src/modules/files/errors/file.not-found.error.js'
import { CreateContactRepository } from '#src/app/contact/use-cases/create-contact/create-contact.repository.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'

describe('CreateContactUseCase Unit test', () => {
  before(() => {
    TestBench.setupUnitTest()
  })

  it('throws an error when the file does not exist', async () => {
    const contactRepo = createStubInstance(CreateContactRepository)
    contactRepo.fileExists.resolves(false)

    const useCase = new CreateContactUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      contactRepo
    )

    const fileUuid = generateUuid<FileUuid>()

    const command = new CreateContactCommandBuilder()
      .withFileUuid(fileUuid)
      .build()

    await expect(useCase.execute(command))
      .rejects.toThrow(new FileNotFoundError(fileUuid))
  })

  it('throws an error when the avatar does not exist', async () => {
    const contactRepo = createStubInstance(CreateContactRepository)
    const avatarUuid = generateUuid<FileUuid>()

    contactRepo.fileExists.resolves(false)

    const useCase = new CreateContactUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      contactRepo
    )

    const command = new CreateContactCommandBuilder()
      .withAvatarUuid(avatarUuid)
      .build()

    await expect(useCase.execute(command))
      .rejects.toThrow(new FileNotFoundError(avatarUuid))
  })

  it('the use cases calls the repository once', async () => {
    const eventEmitter = createStubInstance(DomainEventEmitter)

    const contactRepo = createStubInstance(CreateContactRepository)

    const useCase = new CreateContactUseCase(
      stubDataSource(),
      eventEmitter,
      contactRepo
    )
    const command = new CreateContactCommandBuilder().build()

    await useCase.execute(command)

    assert.calledOnce(contactRepo.insert)
  })

  it('lowercases the email before inserting the contact', async () => {
    const contactRepo = createStubInstance(CreateContactRepository)

    const useCase = new CreateContactUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      contactRepo
    )
    const command = new CreateContactCommandBuilder()
      .withEmail('John.Doe@Example.COM')
      .build()

    await useCase.execute(command)

    assert.calledWithMatch(contactRepo.insert, { email: 'john.doe@example.com' })
  })

  it('the use cases emits a contact created event', async () => {
    const eventEmitter = createStubInstance(DomainEventEmitter)

    const contactRepo = createStubInstance(CreateContactRepository)
    contactRepo.fileExists.resolves(true)

    const useCase = new CreateContactUseCase(
      stubDataSource(),
      eventEmitter,
      contactRepo
    )
    const command = new CreateContactCommandBuilder().build()

    const { uuid: contactUuid } = await useCase.execute(command)

    const expectedContact = new ContactBuilder()
      .withUuid(contactUuid)
      .withFirstName(command.firstName)
      .withLastName(command.lastName)
      .withEmail(command.email)
      .withPhone(command.phone)
      .withAddress(command.address?.parse() ?? null)
      .build()

    expect(eventEmitter).toHaveEmitted(new ContactCreatedEvent(expectedContact))
  })
})
