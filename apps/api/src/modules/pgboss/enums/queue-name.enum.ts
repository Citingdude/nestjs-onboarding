import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'

export enum QueueName {
  SYSTEM = 'system',
  NATS_OUTBOX = 'nats-outbox'
}

export function QueueNameApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: QueueName,
    enumName: 'QueueName'
  })
}
