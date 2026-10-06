import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@wisemen/nestjs-typeorm'
import { SetUserRolesUseCase } from './set-user-roles.use-case.js'
import { SetUserRolesController } from './set-user-roles.controller.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import { UserRoleCacheModule } from '#src/modules/auth/users/cache/user-role/user-role-cache.module.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Role
    ]),
    UserRoleCacheModule
  ],
  controllers: [SetUserRolesController],
  providers: [SetUserRolesUseCase]
})
export class SetUserRolesModule {}
