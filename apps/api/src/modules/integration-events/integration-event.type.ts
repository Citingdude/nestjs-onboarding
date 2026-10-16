import type { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiProperty } from '@nestjs/swagger'

export enum IntegrationEventType {
  CONTACT_CREATED = 'contact.created',
  CONTACT_DELETED = 'contact.deleted',
  CONTACT_UPDATED = 'contact.updated',
  CONTACTS_EXPORTED = 'contacts.exported',

  TODO_CREATED = 'todo.created',
  TODO_UPDATED = 'todo.updated',
  TODO_COMPLETED = 'todo.completed',
  TODO_UNCOMPLETED = 'todo.uncompleted',
  TODO_DELETED = 'todo.deleted',

  EXPORT_FAILED = 'export.failed',
  EXPORT_SUCCEEDED = 'export.succeeded',

  USER_NOTIFICATION_CREATED = 'user.notification.created'
}

export function IntegrationEventTypeApiProperty (options?: ApiPropertyOptions): PropertyDecorator {
  return ApiProperty({
    ...options,
    enum: IntegrationEventType,
    enumName: 'IntegrationEventType'
  })
}
