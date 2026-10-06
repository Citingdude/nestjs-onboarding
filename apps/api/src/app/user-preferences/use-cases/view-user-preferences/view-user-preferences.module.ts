import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewUserPreferencesUseCase } from './view-user-preferences.use-case.js'
import { ViewUserPreferencesController } from './view-user-preferences.controller.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import { DefaultUserPreferencesFactory } from '#src/app/user-preferences/entities/default-user-preferences.factory.js'
import { LocalizationModule } from '#src/modules/localization/modules/localization.module.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPreferences]),
    LocalizationModule
  ],
  controllers: [
    ViewUserPreferencesController
  ],
  providers: [
    ViewUserPreferencesUseCase,
    DefaultUserPreferencesFactory
  ]
})
export class ViewUserPreferencesModule { }
