import { Module } from '@nestjs/common'
import { ViewUserPreferencesModule } from './use-cases/view-user-preferences/view-user-preferences.module.js'
import { UpdateUserPreferencesModule } from './use-cases/update-user-preferences/update-user-preferences.module.js'

@Module({
  imports: [
    UpdateUserPreferencesModule,
    ViewUserPreferencesModule
  ]
})
export class UserPreferencesModule { }
