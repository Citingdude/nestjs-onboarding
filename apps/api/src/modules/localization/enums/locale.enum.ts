import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'

export enum Locale {
  EN_US = 'en-US',
  NL_BE = 'nl-BE'
}

export function LocaleApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: Locale,
    enumName: 'Locale'
  })
}
