import { before, describe, it } from 'node:test'
import { TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { generateUuid } from '@wisemen/nestjs-common'
import { ContactNotFoundError } from '#src/app/contact/errors/contact.not-found.error.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { Contact } from '#src/app/contact/entities/contact.entity.js'
import { DeleteContactUseCase } from '#src/app/contact/use-cases/delete-contact/delete-contact.use-case.js'
import { ContactDeletedEvent } from '#src/app/contact/use-cases/delete-contact/contact-deleted.event.js'
import type { ContactUuid } from '#src/app/contact/entities/contact.uuid.js'

describe('DeleteContactUseCase Unit test', () => {
  before(() => {
    TestBench.setupUnitTest()
  })

  it('throws an error when the contact does not exist', async () => {
    const contactRepo = createStubInstance(TypeOrmRepository<Contact>)
    contactRepo.existsBy.resolves(false)

    const useCase = new DeleteContactUseCase(
      stubDataSource(),
      createStubInstance(DomainEventEmitter),
      contactRepo
    )

    const contactUuid = generateUuid<ContactUuid>()

    await expect(useCase.execute(contactUuid))
      .rejects.toThrow(new ContactNotFoundError(contactUuid))
  })

  it('emits a contact deleted event', async () => {
    const contactRepo = createStubInstance(TypeOrmRepository<Contact>)
    contactRepo.existsBy.resolves(true)

    const eventEmitter = createStubInstance(DomainEventEmitter)

    const useCase = new DeleteContactUseCase(
      stubDataSource(),
      eventEmitter,
      contactRepo
    )

    const contactUuid = generateUuid<ContactUuid>()

    await useCase.execute(contactUuid)

    expect(eventEmitter).toHaveEmitted(new ContactDeletedEvent(contactUuid))
  })
})
