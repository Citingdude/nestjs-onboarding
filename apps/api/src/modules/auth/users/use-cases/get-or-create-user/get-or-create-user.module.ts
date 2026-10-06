import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { GetOrCreateUserUseCase } from './get-or-create-user.use-case.js'
import { GetOrCreateUserRepository } from './get-or-create-user.repository.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  providers: [
    GetOrCreateUserUseCase,
    GetOrCreateUserRepository
  ],
  exports: [
    GetOrCreateUserUseCase
  ]
})
export class GetOrCreateUserModule {}
