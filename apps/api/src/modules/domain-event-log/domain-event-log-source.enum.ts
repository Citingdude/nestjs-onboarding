import { type ApiPropertyOptions, ApiProperty } from '@nestjs/swagger'

export enum DomainEventLogSource {
  USER = 'user',
  SYSTEM = 'system'
}

export function DomainEventLogSourceApiProperty (
  options?: ApiPropertyOptions
): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: DomainEventLogSource,
    enumName: 'DomainEventLogSource'
  })
}
