import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewMeUseCase } from './view-me.use-case.js'
import { ViewMeController } from './view-me.controller.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ])
  ],
  controllers: [ViewMeController],
  providers: [ViewMeUseCase]
})
export class ViewMeModule {}
