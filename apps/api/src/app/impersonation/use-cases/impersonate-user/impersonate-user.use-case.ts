import assert from 'assert'
import { Injectable } from '@nestjs/common'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DataSource } from 'typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { ImpersonateUserRepository } from './impersonate-user.repository.js'
import { ImpersonateUserResponse } from './impersonate-user.response.js'
import { UserImpersonatedEvent } from './user-impersonated.event.js'
import { ImpersonationTokenService } from '#src/app/impersonation/services/impersonation-token.service.js'
import { TargetNotImpersonatableError } from '#src/app/impersonation/errors/target-not-impersonatable.error.js'
import type { ImpersonateUserCommand } from '#src/app/impersonation/use-cases/impersonate-user/impersonate-user.command.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'

const NON_IMPERSONATABLE_PERMISSIONS = [Permission.ALL_PERMISSIONS, Permission.USER_IMPERSONATE]

@Injectable()
export class ImpersonateUserUseCase {
  constructor (
    private readonly dataSource: DataSource,
    private readonly eventEmitter: DomainEventEmitter,
    private readonly repository: ImpersonateUserRepository,
    private readonly tokenService: ImpersonationTokenService
  ) {}

  async execute (
    command: ImpersonateUserCommand,
    actingUserUuid: UserUuid
  ): Promise<ImpersonateUserResponse> {
    const target = await this.repository.findUser(command.targetUserUuid)

    if (target === null) {
      throw new UserNotFoundError(command.targetUserUuid)
    }

    assert(target.userRoles !== undefined, 'userRoles not loaded')

    const isPrivileged = target.userRoles.some((userRole) => {
      assert(userRole.role !== undefined, 'role not loaded')

      return userRole.role.isSystemAdmin
        || userRole.role.permissions.some(p => NON_IMPERSONATABLE_PERMISSIONS.includes(p))
    })

    if (isPrivileged) {
      throw new TargetNotImpersonatableError(command.targetUserUuid)
    }

    const token = await this.tokenService.exchangeToken(target.userId)

    const event = new UserImpersonatedEvent(target.uuid, actingUserUuid)

    await transaction(this.dataSource, async () => {
      await this.eventEmitter.emitOne(event)
    })

    return new ImpersonateUserResponse(token, target)
  }
}
