import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import type { ColumnOptions } from 'typeorm'
import { Column } from 'typeorm'

export enum HourCycle {
  TWELVE_HOUR = '12-hour',
  TWENTY_FOUR_HOUR = '24-hour',
  DEVICE_DEFAULT = 'device-default'
}

export function HourCycleApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: HourCycle,
    enumName: 'HourCycle'
  })
}

type HourCycleColumnOptions = Omit<ColumnOptions, 'type' | 'enum' | 'enumName'>
export function HourCycleColumn (
  options?: HourCycleColumnOptions
): PropertyDecorator {
  return Column({
    ...options,
    type: 'enum',
    enum: HourCycle,
    enumName: 'hour_cycle'
  })
}
