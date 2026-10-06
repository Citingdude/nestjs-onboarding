import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { RoleCache } from './role-cache.js'
import { DefaultRedisModule } from '#src/modules/redis/default-redis.module.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Module({
  imports: [
    DefaultRedisModule,
    TypeOrmModule.forFeature([Role])
  ],
  controllers: [],
  providers: [RoleCache],
  exports: [RoleCache]
})
export class RoleCacheModule {}
