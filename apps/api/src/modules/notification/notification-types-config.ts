import { exhaustiveCheck } from '@wisemen/nestjs-common'
import type { NotificationPreferences } from './entities/notification-preferences.entity.js'
import { NotificationPreferencesBuilder } from './entities/notification-preferences.entity.builder.js'
import { NotificationChannel } from './enums/notification-channel.enum.js'
import { NotificationType } from './enums/notification-types.enum.js'
import { NotificationTypeChannelConfig } from './use-cases/get-notification-types-config/get-notification-types-config.response.js'

type NotificationTypeChannelsConfig = {
  defaultChannels: NotificationChannel[]
  supportedChannels: NotificationChannel[]
}

function createNotificationChannelDefaultsForType (
  type: NotificationType
): NotificationTypeChannelConfig[] {
  const channels: NotificationTypeChannelConfig[] = []

  const channelValues = Object.values(NotificationChannel)

  const typeDefaults = getDefaultForType(type)

  for (const channel of channelValues) {
    const defaultValue = typeDefaults.defaultChannels.includes(channel)
    const isSupported = typeDefaults.supportedChannels.includes(channel)

    channels.push(new NotificationTypeChannelConfig({ channel, defaultValue, isSupported }))
  }

  return channels
}

export function getDefaultForType (type: NotificationType): NotificationTypeChannelsConfig {
  switch (type) {
    case NotificationType.USER_CREATED:return {
      defaultChannels: [NotificationChannel.APP],
      supportedChannels: [NotificationChannel.APP]
    }
    case NotificationType.TEST_NOTIFICATION: return {
      defaultChannels: [NotificationChannel.APP],
      supportedChannels: [NotificationChannel.APP]
    }
    default: exhaustiveCheck(type)
  }
}

export function getDefaultTypesOfChannel (
  notificationChannel: NotificationChannel
): NotificationType[] {
  const result: NotificationType[] = []

  for (const defaultType of NOTIFICATION_TYPES_CONFIG) {
    for (const channelConfig of defaultType.channels) {
      if (channelConfig.channel === notificationChannel && channelConfig.defaultValue) {
        result.push(defaultType.type)
        break
      }
    }
  }

  return result
}

export function getSupportedNotificationTypesOfChannel (
  notificationChannel: NotificationChannel
): NotificationType[] {
  const result: NotificationType[] = []

  for (const defaultType of NOTIFICATION_TYPES_CONFIG) {
    for (const channelConfig of defaultType.channels) {
      if (channelConfig.channel === notificationChannel && channelConfig.isSupported) {
        result.push(defaultType.type)
        break
      }
    }
  }

  return result
}

export function getSupportedNotificationChannels (
  notificationType: NotificationType
): NotificationChannel[] {
  return getDefaultForType(notificationType).supportedChannels
}

export function isEnabledByDefaultForChannel (
  type: NotificationType,
  channel: NotificationChannel
): boolean {
  return getDefaultTypesOfChannel(channel).includes(type)
}

function initAllNotificationPreferences (): NotificationPreferences[] {
  const channels = Object.values(NotificationChannel)
  const allPreferences: NotificationPreferences[] = []

  for (const channel of channels) {
    const supportedTypes = getSupportedNotificationTypesOfChannel(channel)

    const newNotificationPreference = new NotificationPreferencesBuilder()
      .withChannel(channel)
      .withTypes(supportedTypes)
      .withIsEnabled(true)
      .build()

    allPreferences.push(newNotificationPreference)
  }

  return allPreferences
}

function initDefaultNotificationPreferences (): NotificationPreferences[] {
  const channels = Object.values(NotificationChannel)
  const defaultPreferences: NotificationPreferences[] = []

  for (const channel of channels) {
    const defaultTypesForChannel = getDefaultTypesOfChannel(channel)

    const newNotificationPreference = new NotificationPreferencesBuilder()
      .withChannel(channel)
      .withTypes(defaultTypesForChannel)
      .withIsEnabled(true)
      .build()

    defaultPreferences.push(newNotificationPreference)
  }

  return defaultPreferences
}

export interface NotificationTypeConfig {
  type: NotificationType
  channels: NotificationTypeChannelConfig[]
}

function initConfig (): NotificationTypeConfig[] {
  const defaults: NotificationTypeConfig[] = []

  const types = Object.values(NotificationType)

  for (const type of types) {
    defaults.push({ type, channels: createNotificationChannelDefaultsForType(type) })
  }

  return defaults
}

export const NOTIFICATION_TYPES_CONFIG = initConfig()
export const DEFAULT_NOTIFICATION_PREFERENCES = initDefaultNotificationPreferences()
export const ALL_NOTIFICATION_PREFERENCES = initAllNotificationPreferences()
