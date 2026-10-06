import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator'
import {
  NotificationChannel,
  NotificationChannelApiProperty
} from '#src/modules/notification/enums/notification-channel.enum.js'

export class UpdateMyChannelNotificationPreferenceCommand {
  @NotificationChannelApiProperty()
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel: NotificationChannel

  @ApiProperty({ type: Boolean })
  @IsNotEmpty()
  @IsBoolean()
  isEnabled: boolean
}
