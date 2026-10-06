import { after, before, describe, it } from 'node:test'
import request from 'supertest'
import { expect } from 'expect'
import type { TestAuthContext } from '#src/modules/test-setup/test-auth-context.js'
import type { TestUser } from '#src/modules/auth/users/tests/setup-user.type.js'
import { UiTheme } from '#src/app/user-preferences/enums/ui-theme.enum.js'
import type { TestSetup } from '#src/modules/test-setup/test-setup.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { DisplayZoom } from '#src/app/user-preferences/enums/display-zoom.enum.js'
import { Locale } from '#src/modules/localization/enums/locale.enum.js'
import { AutoCloseNotifications } from '#src/app/user-preferences/enums/auto-close-notifications.enum.js'
import { NumberFormat } from '#src/app/user-preferences/enums/number-format.enum.js'
import { HourCycle } from '#src/app/user-preferences/enums/hour-cycle.enum.js'

describe('View user preferences e2e', () => {
  let setup: TestSetup
  let context: TestAuthContext
  let user: TestUser

  before(async () => {
    setup = await TestBench.setupEndToEndTest()
    context = setup.authContext
    user = await context.getUser([])
  })

  after(async () => await setup.teardown())

  describe('View preferences', () => {
    it('should return 200 for own preferences', async () => {
      const response = await request(setup.httpServer)
        .get(`/api/v1/me/user-preferences`)
        .set('Authorization', `Bearer ${user.token}`)
        .set('Accept-Language', 'en-US')

      expect(response).toHaveStatus(200)
      expect(response.body).toEqual({
        appearance: UiTheme.SYSTEM,
        language: Locale.EN_US,
        displayZoom: DisplayZoom.DEFAULT,
        showShortcuts: false,
        showNavigationArrows: false,
        autoCloseNotifications: AutoCloseNotifications.ALL_EXCEPT_ERRORS,
        reducedMotion: false,
        highContrast: false,
        numberFormat: NumberFormat.SYSTEM,
        hourCycle: HourCycle.DEVICE_DEFAULT,
        timeZone: null
      })
    })
  })
})
