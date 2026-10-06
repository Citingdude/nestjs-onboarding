import type { NotificationType } from '#src/modules/notification/enums/notification-types.enum.js'

export function getNotificationGroup (type: NotificationType) {
  const dotIndex = type.indexOf('.')
  if (dotIndex > 0) {
    return type.substring(0, dotIndex)
  } else {
    return type
  }
}
