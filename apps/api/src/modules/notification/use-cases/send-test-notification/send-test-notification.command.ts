import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class SendTestNotificationCommand {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsNotEmpty()
  message: string
}
