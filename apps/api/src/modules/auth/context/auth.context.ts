import { AsyncLocalStorage } from 'async_hooks'
import { Injectable } from '@nestjs/common'
import { context, type Span, trace } from '@opentelemetry/api'
import { UnauthorizedApiError } from '@wisemen/api-error'
import { exhaustiveCheck } from '@wisemen/nestjs-common'
import { NoAuthorizationContextError } from '#src/modules/auth/context/no-authorization-context.error.js'
import type { AuthPrincipal } from '#src/modules/auth/authentication/auth-principal.type.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { PermissionSet } from '#src/modules/auth/permission/permission-set.js'
import type { Permission } from '#src/modules/auth/permission/permission.enum.js'
import { AuthorizationService } from '#src/modules/auth/authorization/authorization.service.js'

@Injectable()
export class AuthContext {
  private authStorage = new AsyncLocalStorage<
    { principal: AuthPrincipal, permissions?: PermissionSet }
    | UnauthorizedApiError
  >()

  constructor (
    private service: AuthorizationService
  ) {}

  getAuth (): AuthPrincipal | null {
    const auth = this.authStorage.getStore()

    if (auth === undefined) {
      return null
    }

    if (auth instanceof UnauthorizedApiError) {
      return null
    }

    return auth.principal
  }

  getAuthOrFail (): AuthPrincipal {
    const auth = this.authStorage.getStore()

    if (auth === undefined) {
      throw new NoAuthorizationContextError()
    }

    if (auth instanceof UnauthorizedApiError) {
      throw auth
    }

    return auth.principal
  }

  getUserUuid (): UserUuid | null {
    const auth = this.getAuth()

    if (auth == null) {
      return null
    } else if (auth.type === 'user') {
      return auth.userUuid
    } else if (auth.type === 'api-key') {
      return auth.userUuid
    } else {
      exhaustiveCheck(auth)
    }
  }

  getUserUuidOrFail (): UserUuid {
    const auth = this.getAuthOrFail()

    if (auth.type === 'user') {
      return auth.userUuid
    } else if (auth.type === 'api-key') {
      return auth.userUuid
    } else {
      exhaustiveCheck(auth)
    }
  }

  async hasAnyPermission (requiredPermissions: Permission[]): Promise<boolean> {
    const permissions = await this.getPermissions()
    return permissions.hasAny(requiredPermissions)
  }

  run (principal: AuthPrincipal, callback: () => void): void {
    this.setAuthTrace(principal)
    this.authStorage.run({ principal }, callback)
  }

  runWithError (err: UnauthorizedApiError, cb: () => void): void {
    this.authStorage.run(err, cb)
  }

  private setAuthTrace (auth: AuthPrincipal) {
    const span: Span | undefined = trace.getSpan(context.active())

    if (span) {
      span.setAttribute('auth.type', auth.type)

      if (auth.type === 'user') {
        span.setAttribute('auth.userId', auth.userId)
        span.setAttribute('auth.userUuid', auth.userUuid)
      } else {
        span.setAttribute('auth.userUuid', auth.userUuid)
        span.setAttribute('auth.apiKeyUuid', auth.apiKeyUuid)
      }
    }
  }

  async getPermissions (): Promise<PermissionSet> {
    const stored = this.authStorage.getStore()
    if (stored === undefined) {
      throw new NoAuthorizationContextError()
    }

    if (stored instanceof UnauthorizedApiError) {
      throw stored
    }

    if (stored.permissions === undefined) {
      stored.permissions = await this.service.getPermissions(stored.principal)
    }

    return stored.permissions
  }
}
