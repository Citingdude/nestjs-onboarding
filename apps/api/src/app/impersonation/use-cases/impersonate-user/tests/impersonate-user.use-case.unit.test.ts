import { before, describe, it } from 'node:test'
import { createStubInstance } from 'sinon'
import { expect } from 'expect'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import { stubDataSource } from '@wisemen/nestjs-tests'
import { ImpersonateUserUseCase } from '#src/app/impersonation/use-cases/impersonate-user/impersonate-user.use-case.js'
import { ImpersonateUserRepository } from '#src/app/impersonation/use-cases/impersonate-user/impersonate-user.repository.js'
import { ImpersonateUserCommand } from '#src/app/impersonation/use-cases/impersonate-user/impersonate-user.command.js'
import { UserImpersonatedEvent } from '#src/app/impersonation/use-cases/impersonate-user/user-impersonated.event.js'
import { ImpersonationTokenService } from '#src/app/impersonation/services/impersonation-token.service.js'
import { TargetNotImpersonatableError } from '#src/app/impersonation/errors/target-not-impersonatable.error.js'
import { TestBench } from '#src/modules/test-setup/test-bench.js'
import { RoleBuilder } from '#src/modules/auth/roles/entities/role.entity.builder.js'
import type { Role } from '#src/modules/auth/roles/entities/role.entity.js'
import { UserRoleBuilder } from '#src/modules/auth/roles/entities/user-role.entity.builder.js'
import { UserBuilder } from '#src/modules/auth/users/entities/user.entity.builder.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { UserNotFoundError } from '#src/modules/auth/users/errors/user-not-found.error.js'
import type { User } from '#src/modules/auth/users/entities/user.entity.js'

const TARGET_UUID = '11111111-1111-1111-1111-111111111111' as UserUuid
const ACTING_UUID = '22222222-2222-2222-2222-222222222222' as UserUuid

function buildTarget (roles: Role[]): User {
  const user = new UserBuilder()
    .withUuid(TARGET_UUID)
    .withId('zitadel-target-id')
    .withEmail('target@mail.com')
    .build()

  user.userRoles = roles.map((role) => {
    const userRole = new UserRoleBuilder().withUserUuid(TARGET_UUID).build()
    userRole.role = role
    return userRole
  })

  return user
}

function buildUseCase (target: User | null): {
  useCase: ImpersonateUserUseCase
  eventEmitter: ReturnType<typeof createStubInstance<DomainEventEmitter>>
} {
  const repository = createStubInstance(ImpersonateUserRepository)
  repository.findUser.resolves(target)

  const tokenService = createStubInstance(ImpersonationTokenService)
  tokenService.exchangeToken.resolves({ accessToken: 'impersonated', expiresIn: 3600 })

  const eventEmitter = createStubInstance(DomainEventEmitter)

  const useCase = new ImpersonateUserUseCase(
    stubDataSource(),
    eventEmitter,
    repository,
    tokenService
  )

  return { useCase, eventEmitter }
}

describe('ImpersonateUserUseCase unit tests', () => {
  before(() => TestBench.setupUnitTest())

  const command = Object.assign(new ImpersonateUserCommand(), { targetUserUuid: TARGET_UUID })

  it('returns a token and emits the audit event for an eligible target', async () => {
    const eligibleRole = new RoleBuilder().withPermissions([Permission.USER_READ]).build()
    const { useCase, eventEmitter } = buildUseCase(buildTarget([eligibleRole]))

    const result = await useCase.execute(command, ACTING_UUID)

    expect(result.accessToken).toBe('impersonated')
    expect(result.impersonatedUser.userUuid).toBe(TARGET_UUID)
    expect(eventEmitter).toHaveEmitted(new UserImpersonatedEvent(TARGET_UUID, ACTING_UUID))
  })

  it('throws UserNotFoundError when the target does not exist', async () => {
    const { useCase } = buildUseCase(null)

    await expect(useCase.execute(command, ACTING_UUID))
      .rejects.toThrow(new UserNotFoundError(TARGET_UUID))
  })

  it('throws TargetNotImpersonatableError when the target holds ALL_PERMISSIONS (privileged)', async () => {
    const privilegedRole = new RoleBuilder().withPermissions([Permission.ALL_PERMISSIONS]).build()
    const { useCase } = buildUseCase(buildTarget([privilegedRole]))

    await expect(useCase.execute(command, ACTING_UUID))
      .rejects.toThrow(new TargetNotImpersonatableError(TARGET_UUID))
  })

  it('throws TargetNotImpersonatableError when the target holds user.impersonate', async () => {
    const impersonatorRole = new RoleBuilder()
      .withPermissions([Permission.USER_IMPERSONATE])
      .build()
    const { useCase } = buildUseCase(buildTarget([impersonatorRole]))

    await expect(useCase.execute(command, ACTING_UUID))
      .rejects.toThrow(new TargetNotImpersonatableError(TARGET_UUID))
  })

  it('throws TargetNotImpersonatableError when the target has a system-admin role (privileged)', async () => {
    const systemAdminRole = new RoleBuilder()
      .withPermissions([Permission.USER_READ])
      .withIsSystemAdmin(true)
      .build()
    const { useCase } = buildUseCase(buildTarget([systemAdminRole]))

    await expect(useCase.execute(command, ACTING_UUID))
      .rejects.toThrow(new TargetNotImpersonatableError(TARGET_UUID))
  })
})
