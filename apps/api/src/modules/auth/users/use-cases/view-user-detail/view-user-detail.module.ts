import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ViewUserDetailController } from './view-user-detail.controller.js'
import { ViewUserDetailUseCase } from './view-user-detail.use-case.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User
    ])
  ],
  controllers: [ViewUserDetailController],
  providers: [ViewUserDetailUseCase]
})
export class ViewUserDetailModule {}
