import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import type { ColumnOptions } from 'typeorm'
import { Column } from 'typeorm'

export enum NumberFormat {
  COMMA_PERIOD = 'comma-period',
  PERIOD_COMMA = 'period-comma',
  SPACE_COMMA = 'space-comma',
  SPACE_PERIOD = 'space-period',
  SYSTEM = 'system'
}

export function NumberFormatApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: NumberFormat,
    enumName: 'NumberFormat'
  })
}

type NumberFormatColumnOptions = Omit<ColumnOptions, 'type' | 'enum' | 'enumName'>
export function NumberFormatColumn (
  options?: NumberFormatColumnOptions
): PropertyDecorator {
  return Column({
    ...options,
    type: 'enum',
    enum: NumberFormat,
    enumName: 'number_format'
  })
}
