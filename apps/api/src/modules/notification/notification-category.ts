import type { NotificationType } from './enums/notification-types.enum.js'

export function notificationCategory (type: NotificationType): string {
  const dotIndex = type.indexOf('.')
  return type.substring(0, dotIndex)
}
