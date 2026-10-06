export enum DomainEventType {
  API_KEY_CREATED = 'api-key.created',
  API_KEY_DELETED = 'api-key.deleted',

  CONTACT_CREATED = 'contact.created',
  CONTACT_UPDATED = 'contact.updated',
  CONTACT_DELETED = 'contact.deleted',

  EXPORT_SUCCEEDED = 'export.succeeded',
  EXPORT_FAILED = 'export.failed',

  FILE_CREATED = 'file.created',
  FILE_VARIANT_CREATED = 'file.variant.created',
  FILE_UPLOADED = 'file.uploaded',

  NOTIFICATION_CREATED = 'notification.created',
  NOTIFICATION_READ = 'notification.read',
  NOTIFICATION_READ_ALL = 'notification.read.all',
  NOTIFICATION_UNREAD = 'notification.unread',
  NOTIFICATION_TYPES_MIGRATED = 'notification.types.migrated',
  NOTIFICATION_PREFERENCE_PRESET_UPDATED = 'notification.preference.preset.updated',

  ROLE_CREATED = 'role.created',
  ROLE_DELETED = 'role.deleted',
  ROLE_RENAMED = 'role.renamed',
  ROLE_PERMISSIONS_UPDATED = 'role.permissions.updated',
  ROLE_PERMISSIONS_CACHE_CLEARED = 'role.permissions.cache.cleared',

  TEST_NOTIFICATION_SENT = 'test-notification.sent',

  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_ROLE_ASSIGNED = 'user.role-assigned',
  USER_ROLES_SET = 'user.roles-set',
  USER_IMPERSONATED = 'user.impersonated',
  USER_NOTIFICATION_CREATED = 'user.notification.created',
  USER_DEFAULT_NOTIFICATION_PREFERENCES_ASSIGNED = 'user.default-notification-preferences.assigned'
}
