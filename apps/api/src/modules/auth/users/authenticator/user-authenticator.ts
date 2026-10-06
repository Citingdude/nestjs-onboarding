import { Injectable } from '@nestjs/common'
import { InjectJwtVerifier, type JwtVerifier } from '@wisemen/nestjs-jwt-verifier'
import type { AuthenticatedUser } from '#src/modules/auth/authentication/auth-principal.type.js'
import { AuthenticatedUserCache } from '#src/modules/auth/users/authenticator/authenticated-user-cache.js'
import { GetOrCreateUserCommandBuilder } from '#src/modules/auth/users/use-cases/get-or-create-user/get-or-create-user.command.builder.js'
import { GetOrCreateUserUseCase } from '#src/modules/auth/users/use-cases/get-or-create-user/get-or-create-user.use-case.js'

interface UserTokenContent {
  sub: string
  email: string
}

@Injectable()
export class UserAuthenticator {
  constructor (
    @InjectJwtVerifier('workspace')
    private jwtVerifier: JwtVerifier,
    private cache: AuthenticatedUserCache,
    private getOrCreateUserUseCase: GetOrCreateUserUseCase
  ) {}

  async authenticate (bearerToken: string): Promise<AuthenticatedUser> {
    const token = await this.jwtVerifier.verify<UserTokenContent>(bearerToken)
    const cachedUser = await this.cache.getAuthorizedUser(token.sub)

    if (cachedUser != null) {
      return cachedUser
    }

    const command = new GetOrCreateUserCommandBuilder()
      .withEmail(token.email)
      .withId(token.sub)
      .build()

    const user = await this.getOrCreateUserUseCase.getOrCreateUser(command)

    const response: AuthenticatedUser = {
      type: 'user',
      userUuid: user.uuid,
      userId: user.userId
    }

    await this.cache.setAuthorizedUser(token.sub, response)

    return response
  }
}
