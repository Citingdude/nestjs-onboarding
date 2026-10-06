import assert from 'assert'
import { Injectable } from '@nestjs/common'
import { Any, DataSource } from 'typeorm'
import { InjectRepository, TypeOrmRepository, transaction } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import type { SetUserRolesCommand } from './set-user-roles.command.js'
import { UserRole } from '#src/modules/auth/roles/entities/user-role.entity.js'
import { User } from '#src/modules/auth/users/entities/user.entity.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'
import { UserRolesSetEvent } from '#src/modules/auth/users/use-cases/set-user-roles/user-roles-set.event.js'
import { UserRoleCache } from '#src/modules/auth/users/cache/user-role/user-role-cache.js'
import { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { RoleNotFoundError } from '#src/modules/auth/roles/errors/role-not-found.error.js'

@Injectable()
export class SetUserRolesUseCase {
  constructor (
    @InjectRepository(UserRole) private userRoleRepository: TypeOrmRepository<UserRole>,
    @InjectRepository(User) private userRepository: TypeOrmRepository<User>,
    @InjectRepository(Role) private roleRepository: TypeOrmRepository<Role>,
    private dataSource: DataSource,
    private eventEmitter: DomainEventEmitter,
    private userRoleCache: UserRoleCache
  ) {}

  async execute (userUuid: UserUuid, dto: SetUserRolesCommand): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { uuid: userUuid },
      relations: { userRoles: { role: true } }
    })

    if (user === null) {
      throw new UserNotFoundError(userUuid)
    }

    assert(user.userRoles != null)

    const roles = await this.roleRepository.find({
      where: { uuid: Any(dto.roleUuids) }
    })

    const notFoundRoleUuid = dto.roleUuids
      .find(roleUuid => !roles.some(role => role.uuid === roleUuid))

    if (notFoundRoleUuid !== undefined) {
      throw new RoleNotFoundError(notFoundRoleUuid)
    }

    const existingRoleUuids = user.userRoles.map(userRole => userRole.roleUuid)

    const rolesToAdd = dto.roleUuids.filter(roleUuid => !existingRoleUuids.includes(roleUuid))
      .map(roleUuid => this.userRoleRepository.create({
        userUuid,
        roleUuid
      }))

    const rolesToRemove = existingRoleUuids.filter(roleUuid => !dto.roleUuids.includes(roleUuid))

    await transaction(this.dataSource, async () => {
      await this.userRoleRepository.insert(rolesToAdd)

      await this.userRoleRepository.delete({
        userUuid,
        roleUuid: Any(rolesToRemove)
      })

      await this.eventEmitter.emitOne(new UserRolesSetEvent(user.uuid, dto.roleUuids))
    })

    await this.userRoleCache.setUserRoles(userUuid, dto.roleUuids)
  }
}
