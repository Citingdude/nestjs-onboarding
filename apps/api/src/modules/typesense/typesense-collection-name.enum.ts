import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'

export enum TypesenseCollectionName {
  USER = 'user',
  CONTACT = 'contact'
}

export function TypesenseCollectionNameApiProperty (
  options?: ApiPropertyOptions
): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: TypesenseCollectionName,
    enumName: 'TypesenseCollectionName'
  })
}
