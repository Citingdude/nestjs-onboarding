import { Module } from '@nestjs/common'
import { ClearUserRoleCacheSubscriber } from './clear-user-role-cache.subscriber.js'
import { UserRoleCacheModule } from '#src/modules/auth/users/cache/user-role/user-role-cache.module.js'

@Module({
  imports: [
    UserRoleCacheModule
  ],
  providers: [ClearUserRoleCacheSubscriber]
})
export class ClearUserRoleCacheSubscriberModule {}
