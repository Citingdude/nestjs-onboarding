import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { DefaultRedisModule } from '#src/modules/redis/default-redis.module.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { UserRoleCache } from '#src/modules/auth/users/cache/user-role/user-role-cache.js'

@Module({
  imports: [
    DefaultRedisModule,
    TypeOrmModule.forFeature([User])
  ],
  controllers: [],
  providers: [UserRoleCache],
  exports: [UserRoleCache]
})
export class UserRoleCacheModule {}
