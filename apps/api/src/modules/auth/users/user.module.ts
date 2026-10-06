import { Module } from '@nestjs/common'

import { SetUserRolesModule } from './use-cases/set-user-roles/set-user-roles.module.js'
import { ViewMeModule } from './use-cases/view-me/view-me.module.js'
import { ViewUserDetailModule } from './use-cases/view-user-detail/view-user-detail.module.js'
import { ViewUserIndexModule } from './use-cases/view-user-index/view-user-index.module.js'

import { DefaultRedisModule } from '#src/modules/redis/default-redis.module.js'

@Module({
  imports: [
    DefaultRedisModule,
    SetUserRolesModule,
    ViewMeModule,
    ViewUserDetailModule,
    ViewUserIndexModule
  ]
})
export class UserModule {}
