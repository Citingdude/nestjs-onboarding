import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { timestamp } from '@wisemen/datewise'
import { CreateApiKeyCommandBuilder } from '#src/modules/auth/api-key/use-cases/create-api-key/create-api-key.command.builder.js'
import type { CreateApiKeyResponse } from '#src/modules/auth/api-key/use-cases/create-api-key/create-api-key.response.js'
import { DomainEventLog } from '#src/modules/domain-event-log/domain-event-log.entity.js'
import { DomainEventActorType } from '#src/modules/domain-events/domain-event-actor-type.enum.js'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { CreateContactCommandBuilder } from '#src/app/contact/use-cases/create-contact/create-contact.command.builder.js'
import type { CreateContactResponse } from '#src/app/contact/use-cases/create-contact/create-contact.response.js'

describe('DomainEventLogActorMiddleware e2e test', () => {
  let setup: TestSetup
  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    user = await setup.authContext.getUser([Permission.API_KEY_CREATE, Permission.CONTACT_READ])
  })

  after(async () => await setup.teardown())

  async function createApiKey (): Promise<CreateApiKeyResponse> {
    const command = new CreateApiKeyCommandBuilder()
      .withPermissions([Permission.CONTACT_READ])
      .withExpiresAt(timestamp().add(1, 'month').toISOString())
      .build()

    const response = await request(setup.httpServer)
      .post('/api/v1/api-keys')
      .set('Authorization', `Bearer ${user.token}`)
      .send(command)

    expect(response).toHaveStatus(201)

    return response.body as CreateApiKeyResponse
  }

  async function findLog (type: DomainEventType, subjectId: string): Promise<DomainEventLog> {
    return await setup.entityManager.findOneByOrFail(DomainEventLog, { type, subjectId })
  }

  it('logs the user as actor when the request is made by a user', async () => {
    const created = await createApiKey()
    const log = await findLog(DomainEventType.API_KEY_CREATED, created.uuid)

    expect(log.actorType).toBe(DomainEventActorType.USER)
    expect(log.actorId).toBe(user.user.uuid)
  })

  it('logs the api key as actor when the request is made by an api key', async () => {
    const apiKeyOwner = await setup.authContext
      .getUser([Permission.API_KEY_CREATE, Permission.CONTACT_CREATE])

    const createApiKeyCommand = new CreateApiKeyCommandBuilder()
      .withPermissions([Permission.CONTACT_CREATE])
      .withExpiresAt(timestamp().add(1, 'month').toISOString())
      .build()

    const createApiKeyResponse = await request(setup.httpServer)
      .post('/api/v1/api-keys')
      .set('Authorization', `Bearer ${apiKeyOwner.token}`)
      .send(createApiKeyCommand)

    expect(createApiKeyResponse).toHaveStatus(201)

    const apiKey = createApiKeyResponse.body as CreateApiKeyResponse

    const createContactCommand = new CreateContactCommandBuilder().build()

    const createContactResponse = await request(setup.httpServer)
      .post('/api/v1/contacts')
      .set('Authorization', `Bearer ${apiKey.apiKey}`)
      .send(createContactCommand)

    expect(createContactResponse).toHaveStatus(201)

    const createdContact = createContactResponse.body as CreateContactResponse
    const log = await findLog(DomainEventType.CONTACT_CREATED, createdContact.uuid)

    expect(log.actorType).toBe(DomainEventActorType.API_KEY)
    expect(log.actorId).toBe(apiKey.uuid)
  })
})
