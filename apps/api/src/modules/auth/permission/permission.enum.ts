export enum Permission {
  ALL_PERMISSIONS = 'all_permissions',

  API_KEY_READ = 'api_key.read',
  API_KEY_READ_OWN = 'api_key.read_own',
  API_KEY_CREATE = 'api_key.create',
  API_KEY_DELETE = 'api_key.delete',
  API_KEY_DELETE_OWN = 'api_key.delete_own',

  CONTACT_CREATE = 'contact.create',
  CONTACT_READ = 'contact.read',
  CONTACT_UPDATE = 'contact.update',
  CONTACT_DELETE = 'contact.delete',
  CONTACT_EXPORT = 'contact.export',

  EVENT_LOG_READ = 'event-log.read',
  EVENT_LOG_EXPORT = 'event-log.export',

  FILE_READ = 'file.read',
  FILE_CREATE = 'file.create',

  EXPORT_READ = 'export.read',

  JOBS_READ_INDEX = 'jobs.read.index',
  JOBS_READ_DETAIL = 'jobs.read.detail',

  NOTIFICATION_READ_OWN = 'notification.read.own',
  NOTIFICATION_READ_CONFIG = 'notification.read.config',
  NOTIFICATION_UPDATE_READ = 'notification.update.read',
  NOTIFICATION_UPDATE_UNREAD = 'notification.update.unread',
  NOTIFICATION_PREFERENCES_UPDATE_CHANNEL = 'notification.preferences.update.channel',
  NOTIFICATION_PREFERENCES_UPDATE_PRESET = 'notification.preferences.update.preset',
  NOTIFICATION_PREFERENCES_UPDATE_TYPES = 'notification.preferences.update.types',
  NOTIFICATION_PREFERENCES_READ_OWN = 'notification.preferences.read.own',
  NOTIFICATION_MIGRATE_TYPE = 'notification.migrate-type',
  NOTIFICATION_SEND_TEST = 'notification.send-test',

  ROLE_READ = 'role.read',
  ROLE_CREATE = 'role.create',
  ROLE_UPDATE = 'role.update',
  ROLE_DELETE = 'role.delete',
  ROLE_CACHE_CLEAR = 'role.cache.clear',

  SEND_PUSH_NOTIFICATION = 'send_push_notification',

  TYPESENSE = 'typesense',

  USER_READ = 'user.read',
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_IMPERSONATE = 'user.impersonate'
}
