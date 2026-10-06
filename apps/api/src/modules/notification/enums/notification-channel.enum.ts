import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  APP = 'app',
  PUSH = 'push'
}

export function NotificationChannelApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: NotificationChannel,
    enumName: 'NotificationChannel'
  })
}
