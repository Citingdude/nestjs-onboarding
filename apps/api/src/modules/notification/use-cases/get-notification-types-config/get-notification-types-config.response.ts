import { ApiProperty } from '@nestjs/swagger'
import { getNotificationGroup } from './get-notification-group.js'
import { NotificationType, NotificationTypeApiProperty } from '#src/modules/notification/enums/notification-types.enum.js'
import { NotificationChannelApiProperty, NotificationChannel } from '#src/modules/notification/enums/notification-channel.enum.js'
import type { NotificationTypeConfig } from '#src/modules/notification/notification-types-config.js'
import { tcr } from '#src/modules/localization/helpers/translate.helper.js'

export class NotificationTypeChannelConfig {
  @NotificationChannelApiProperty()
  channel: NotificationChannel

  @ApiProperty({ type: Boolean })
  defaultValue: boolean

  @ApiProperty({ type: Boolean })
  isSupported: boolean

  constructor (config: NotificationTypeChannelConfig) {
    this.channel = config.channel
    this.defaultValue = config.defaultValue
    this.isSupported = config.isSupported
  }
}

export class ViewNotificationTypeConfigTypeResponse {
  @NotificationTypeApiProperty()
  key: NotificationType

  @ApiProperty({ type: String })
  description: string

  @ApiProperty({ type: NotificationTypeChannelConfig, isArray: true })
  channelConfigs: NotificationTypeChannelConfig[]

  constructor (config: NotificationTypeConfig) {
    this.key = config.type
    this.description = tcr('notifications.' + config.type + '.description')
    this.channelConfigs = config.channels.map(c => new NotificationTypeChannelConfig(c))
  }
}

class ViewNotificationTypesConfigGroupResponse {
  @ApiProperty({ type: String })
  name: string

  @ApiProperty({ type: String })
  description: string

  @ApiProperty({ type: ViewNotificationTypeConfigTypeResponse, isArray: true })
  types: ViewNotificationTypeConfigTypeResponse[]

  constructor (groupKey: string, config: NotificationTypeConfig[]) {
    this.name = tcr('notifications.' + groupKey + '.group-name')
    this.description = tcr('notifications.' + groupKey + '.group-description')
    this.types = config.map(c => new ViewNotificationTypeConfigTypeResponse(c))
  }
}

export class GetNotificationTypesConfigResponse {
  @ApiProperty({ type: ViewNotificationTypesConfigGroupResponse, isArray: true })
  groups: ViewNotificationTypesConfigGroupResponse[]

  constructor (configs: NotificationTypeConfig[]) {
    const groups: Map<string, NotificationTypeConfig[]> = new Map()
    for (const config of configs) {
      const groupKey = getNotificationGroup(config.type)
      const groupMembers = groups.get(groupKey) ?? []
      groupMembers.push(config)
      groups.set(groupKey, groupMembers)
    }

    this.groups = []
    for (const [groupKey, config] of groups.entries()) {
      this.groups.push(new ViewNotificationTypesConfigGroupResponse(groupKey, config))
    }
  }
}
