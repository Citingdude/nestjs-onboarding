import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import { MigrateNotificationTypesCommandBuilder } from '#src/modules/notification/use-cases/migrate-notification-types/migrate-notification-types.command.builder.js'
import { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationMigration } from '#src/modules/notification/entities/notification-migration.entity.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

describe('Migrate notification e2e test', () => {
  let setup: TestSetup
  let userWithPermission: TestUser
  let userWithoutPermission: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    userWithPermission = await setup.authContext.getUser([Permission.NOTIFICATION_MIGRATE_TYPE])
    userWithoutPermission = await setup.authContext.getUser([Permission.NOTIFICATION_READ_OWN])
  })

  after(async () => {
    await setup.teardown()
  })

  it('should migrate new notification types', async () => {
    const command = new MigrateNotificationTypesCommandBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/notifications/migrate`)
      .set('Authorization', `Bearer ${userWithPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(204)

    const createdNotificationMigration = await setup.entityManager.findOne(NotificationMigration, {
      where: {
        type: NotificationType.USER_CREATED
      }
    })

    expect(createdNotificationMigration?.migratedAt).not.toBe(null)
  })

  it('returns 403 when user does not have permission', async () => {
    const command = new MigrateNotificationTypesCommandBuilder()
      .withTypes([NotificationType.USER_CREATED])
      .build()

    const response = await request(setup.httpServer)
      .post(`/api/v1/notifications/migrate`)
      .set('Authorization', `Bearer ${userWithoutPermission.token}`)
      .send(command)

    expect(response).toHaveStatus(403)
  })
})
