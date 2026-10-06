import { IsArray, IsEnum, IsNotEmpty } from 'class-validator'
import { NotificationType, NotificationTypeApiProperty } from '#src/modules/notification/enums/notification-types.enum.js'

export class MigrateNotificationTypesCommand {
  @NotificationTypeApiProperty({ isArray: true })
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  @IsNotEmpty()
  types: NotificationType[]
}
