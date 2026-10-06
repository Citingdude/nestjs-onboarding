import { ApiProperty } from '@nestjs/swagger'
import { IsUndefinable, IsQueryBoolean } from '@wisemen/validators'

export class GetMyNotificationsFilterQuery {
  @ApiProperty({ required: false, example: 'true or false' })
  @IsUndefinable()
  @IsQueryBoolean()
  onlyUnread?: string
}
