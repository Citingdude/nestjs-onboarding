import { Injectable, type NestMiddleware } from '@nestjs/common'
import type { FastifyRequest, FastifyReply } from 'fastify'
import { UnauthorizedApiError } from '@wisemen/api-error'
import { FeatureFlagContext } from '@wisemen/nestjs-feature-flags'
import { UserThrottlerContext } from '@wisemen/nestjs-throttler'
import { Authenticator } from '#src/modules/auth/authentication/authenticator/authenticator.js'
import { AuthContext } from '#src/modules/auth/context/auth.context.js'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor (
    private authenticator: Authenticator,
    private authContext: AuthContext,
    private flagContext: FeatureFlagContext,
    private throttlerContext: UserThrottlerContext
  ) { }

  async use (req: FastifyRequest, _res: FastifyReply, next: () => void): Promise<void> {
    try {
      const auth = await this.authenticator.authenticate(req.headers.authorization)

      this.authContext.run(auth, () => {
        this.throttlerContext.run({ id: auth.userUuid }, () => {
          this.flagContext.run({ userUuid: auth.userUuid }, next)
        })
      })
    } catch (error) {
      if (error instanceof UnauthorizedApiError) {
        this.authContext.runWithError(error, next)
      } else {
        throw error
      }
    }
  }
}
