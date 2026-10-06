import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import type { ColumnOptions } from 'typeorm'
import { Column } from 'typeorm'

export enum UiTheme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

export function UiThemeApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: UiTheme,
    enumName: 'UITheme'
  })
}

type UiThemeColumnOptions = Omit<ColumnOptions, 'type' | 'enum' | 'enumName'>
export function UiThemeColumn (
  options?: UiThemeColumnOptions
): PropertyDecorator {
  return Column({
    ...options,
    type: 'enum',
    enum: UiTheme,
    enumName: 'ui_theme'
  })
}
