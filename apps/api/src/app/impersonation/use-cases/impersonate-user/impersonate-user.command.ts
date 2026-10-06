import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

export class ImpersonateUserCommand {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'The user to impersonate' })
  @IsUUID()
  targetUserUuid: UserUuid
}
