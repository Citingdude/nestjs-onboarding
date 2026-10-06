import { ApiProperty } from '@nestjs/swagger'
import type { ImpersonationToken } from '#src/app/impersonation/services/impersonation-token.type.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'
import type { User } from '#src/modules/auth/users/entities/user.entity.js'

class ImpersonatedUser {
  @ApiProperty({ type: 'string', format: 'uuid' })
  userUuid: UserUuid

  @ApiProperty({ type: String })
  email: string
}

export class ImpersonateUserResponse {
  @ApiProperty({ type: String, description: 'Impersonated Zitadel access token' })
  accessToken: string

  @ApiProperty({ type: Number, description: 'Token lifetime in seconds' })
  expiresIn: number

  @ApiProperty({ type: ImpersonatedUser })
  impersonatedUser: ImpersonatedUser

  constructor (token: ImpersonationToken, user: User) {
    this.accessToken = token.accessToken
    this.expiresIn = token.expiresIn
    this.impersonatedUser = { userUuid: user.uuid, email: user.email }
  }
}
