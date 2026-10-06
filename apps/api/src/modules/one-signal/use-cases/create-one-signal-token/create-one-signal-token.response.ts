import { ApiProperty } from '@nestjs/swagger'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class CreateOneSignalTokenResponse {
  @ApiProperty({ type: String })
  token: string

  @ApiProperty({ type: String, format: 'uuid' })
  userUuid: UserUuid

  constructor (token: string, userUuid: UserUuid) {
    this.token = token
    this.userUuid = userUuid
  }
}
