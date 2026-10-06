import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import type { ColumnOptions } from 'typeorm'
import { Column } from 'typeorm'

export enum DisplayZoom {
  SMALL = 'small',
  DEFAULT = 'default',
  LARGE = 'large'
}

export function DisplayZoomApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: DisplayZoom,
    enumName: 'DisplayZoom'
  })
}

type DisplayZoomColumnOptions = Omit<ColumnOptions, 'type' | 'enum' | 'enumName'>
export function DisplayZoomColumn (
  options?: DisplayZoomColumnOptions
): PropertyDecorator {
  return Column({
    ...options,
    type: 'enum',
    enum: DisplayZoom,
    enumName: 'display_zoom'
  })
}
