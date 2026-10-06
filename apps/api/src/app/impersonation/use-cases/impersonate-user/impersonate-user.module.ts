import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { ImpersonateUserController } from './impersonate-user.controller.js'
import { ImpersonateUserUseCase } from './impersonate-user.use-case.js'
import { ImpersonateUserRepository } from './impersonate-user.repository.js'
import { ImpersonationTokenService } from '#src/app/impersonation/services/impersonation-token.service.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [ImpersonateUserController],
  providers: [
    ImpersonateUserUseCase,
    ImpersonateUserRepository,
    ImpersonationTokenService
  ]
})
export class ImpersonateUserModule {}
