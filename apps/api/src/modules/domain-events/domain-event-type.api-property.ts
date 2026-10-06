import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'
import { DomainEventType } from '#src/modules/domain-events/domain-event-type.js'

export function DomainEventTypeApiProperty (
  options?: ApiPropertyOptions
): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: DomainEventType,
    enumName: 'DomainEventType'
  })
}
