import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'

export enum NotificationPreset {
  ALL = 'all',
  DEFAULT = 'default',
  CUSTOM = 'custom',
  NONE = 'none'
}

export function NotificationPresetApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: NotificationPreset,
    enumName: 'NotificationPreset'
  })
}
