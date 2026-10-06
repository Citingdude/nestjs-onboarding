import { Injectable } from '@nestjs/common'
import { UserPreferencesBuilder } from './user-preferences.entity.builder.js'
import { UserPreferences } from './user-preferences.entity.js'
import { LocalizationContext } from '#src/modules/localization/localization-context.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Injectable()
export class DefaultUserPreferencesFactory {
  constructor (
    private readonly localizationContext: LocalizationContext
  ) {}

  create (forUserUuid: UserUuid): UserPreferences {
    return new UserPreferencesBuilder()
      .withUserUuid(forUserUuid)
      .withLanguage(this.localizationContext.locale)
      .build()
  }
}
