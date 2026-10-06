import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { UpdateUserPreferencesCommand } from './update-user-preferences.command.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import { DefaultUserPreferencesFactory } from '#src/app/user-preferences/entities/default-user-preferences.factory.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@Injectable()
export class UpdateUserPreferencesUseCase {
  constructor (
    private authContext: AuthContext,
    private defaultUserPreferencesFactory: DefaultUserPreferencesFactory,
    @InjectRepository(UserPreferences)
    private preferencesRepository: TypeOrmRepository<UserPreferences>
  ) {}

  async execute (command: UpdateUserPreferencesCommand): Promise<void> {
    const userUuid = this.authContext.getUserUuidOrFail()
    let pref = await this.preferencesRepository.findOneBy({ userUuid })

    if (pref === null) {
      pref = this.defaultUserPreferencesFactory.create(userUuid)
    }

    pref.appearance = command.appearance ?? pref.appearance
    pref.showShortcuts = command.showShortcuts ?? pref.showShortcuts
    pref.showNavigationArrows = command.showNavigationArrows ?? pref.showNavigationArrows
    pref.autoCloseNotifications = command.autoCloseNotifications ?? pref.autoCloseNotifications
    pref.reducedMotion = command.reducedMotion ?? pref.reducedMotion
    pref.highContrast = command.highContrast ?? pref.highContrast
    pref.language = command.language ?? pref.language
    pref.displayZoom = command.displayZoom ?? pref.displayZoom
    pref.numberFormat = command.numberFormat ?? pref.numberFormat
    pref.hourCycle = command.hourCycle ?? pref.hourCycle
    pref.timeZone = command.timeZone ?? pref.timeZone

    await this.preferencesRepository.upsert(pref, { conflictPaths: { userUuid: true } })
  }
}
