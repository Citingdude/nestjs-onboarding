import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { SyncUserFromZitadelRepository } from './sync-user-from-zitadel.repository.js'
import { SyncUserFromZitadelUseCase } from './sync-user-from-zitadel.use-case.js'
import { SyncUserFromZitadelJobHandler } from './sync-user-from-zitadel.job-handler.js'
import { DefaultZitadelModule } from '#src/modules/zitadel/default-zitadel.module.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    DefaultZitadelModule
  ],
  providers: [
    SyncUserFromZitadelJobHandler,
    SyncUserFromZitadelUseCase,
    SyncUserFromZitadelRepository
  ]
})
export class SyncUserFromZitadelJobModule {}
