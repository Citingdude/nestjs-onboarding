import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import type { ColumnOptions } from 'typeorm'
import { Column } from 'typeorm'

export enum AutoCloseNotifications {
  ALWAYS = 'always',
  ALL_EXCEPT_ERRORS = 'all-except-errors',
  NEVER = 'never'
}

export function AutoCloseNotificationsApiProperty (
  options?: ApiPropertyOptions
): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: AutoCloseNotifications,
    enumName: 'AutoCloseNotifications'
  })
}

type AutoCloseNotificationsColumnOptions = Omit<ColumnOptions, 'type' | 'enum' | 'enumName'>
export function AutoCloseNotificationsColumn (
  options?: AutoCloseNotificationsColumnOptions
): PropertyDecorator {
  return Column({
    ...options,
    type: 'enum',
    enum: AutoCloseNotifications,
    enumName: 'auto_close_notifications'
  })
}
