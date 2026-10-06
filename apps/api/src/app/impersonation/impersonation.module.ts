import { Module } from '@nestjs/common'
import { ImpersonateUserModule } from './use-cases/impersonate-user/impersonate-user.module.js'

@Module({
  imports: [
    ImpersonateUserModule
  ]
})
export class ImpersonationModule {}
