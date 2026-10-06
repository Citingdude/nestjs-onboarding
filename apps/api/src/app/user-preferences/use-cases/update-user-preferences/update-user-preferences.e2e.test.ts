import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { DataSource } from 'typeorm'
import type { TestAuthContext } from '#src/modules/test-setup/test-auth-context.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { UiTheme } from '#src/app/user-preferences/enums/ui-theme.enum.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'

describe('Update user preferences e2e', () => {
  let setup: TestSetup
  let dataSource: DataSource
  let context: TestAuthContext

  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    dataSource = setup.dataSource
    context = setup.authContext

    user = await context.getUser([])
  })

  after(async () => await setup.teardown())

  describe('Update preferences', () => {
    it('should return 200 when updating own preferences', async () => {
      const response = await request(setup.httpServer)
        .patch(`/api/v1/me/user-preferences`)
        .set('Authorization', `Bearer ${user.token}`)

      expect(response).toHaveStatus(200)
    })

    it('should return 200 when updating preferences multiple times', async () => {
      const response1 = await request(setup.httpServer)
        .patch(`/api/v1/me/user-preferences`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          appearance: UiTheme.DARK
        })

      expect(response1).toHaveStatus(200)

      let preferences = await dataSource.getRepository(UserPreferences).findOneOrFail({
        where: {
          userUuid: user.user.uuid
        }
      })

      expect(preferences.appearance).toEqual(UiTheme.DARK)

      const response2 = await request(setup.httpServer)
        .patch(`/api/v1/me/user-preferences`)
        .set('Authorization', `Bearer ${user.token}`)
        .send({
          reducedMotion: true
        })

      expect(response2).toHaveStatus(200)

      preferences = await dataSource.getRepository(UserPreferences).findOneOrFail({
        where: {
          userUuid: user.user.uuid
        }
      })

      expect(preferences.appearance).toEqual(UiTheme.DARK)
      expect(preferences.reducedMotion).toEqual(true)
    })
  })
})
