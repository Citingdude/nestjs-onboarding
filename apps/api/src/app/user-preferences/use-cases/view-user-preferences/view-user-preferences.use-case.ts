import { Injectable } from '@nestjs/common'
import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { ViewUserPreferencesResponse } from './view-user-preferences.response.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'
import { DefaultUserPreferencesFactory } from '#src/app/user-preferences/entities/default-user-preferences.factory.js'

@Injectable()
export class ViewUserPreferencesUseCase {
  constructor (
    private readonly authContext: AuthContext,
    private readonly defaultUserPreferencesFactory: DefaultUserPreferencesFactory,
    @InjectRepository(UserPreferences)
    private preferencesRepository: TypeOrmRepository<UserPreferences>
  ) {}

  async execute (): Promise<ViewUserPreferencesResponse> {
    const userUuid = this.authContext.getUserUuidOrFail()
    let preferences = await this.preferencesRepository.findOneBy({ userUuid })

    if (preferences == null) {
      preferences = this.defaultUserPreferencesFactory.create(userUuid)
      await this.preferencesRepository.insert(preferences)
    }

    return new ViewUserPreferencesResponse(preferences)
  }
}
