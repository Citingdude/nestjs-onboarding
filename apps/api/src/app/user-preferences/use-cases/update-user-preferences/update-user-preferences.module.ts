import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { UpdateUserPreferencesUseCase } from './update-user-preferences.use-case.js'
import { UpdateUserPreferencesController } from './update-user-preferences.controller.js'
import { UserPreferences } from '#src/app/user-preferences/entities/user-preferences.entity.js'
import { LocalizationModule } from '#src/modules/localization/modules/localization.module.js'
import { DefaultUserPreferencesFactory } from '#src/app/user-preferences/entities/default-user-preferences.factory.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPreferences]),
    LocalizationModule
  ],
  controllers: [
    UpdateUserPreferencesController
  ],
  providers: [
    UpdateUserPreferencesUseCase,
    DefaultUserPreferencesFactory
  ]
})
export class UpdateUserPreferencesModule { }
