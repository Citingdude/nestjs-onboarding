import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as OneSignal from '@onesignal/node-onesignal'
import { captureException } from '@wisemen/opentelemetry'
import { OneSignalUnavailableError } from './errors/one-signal-unavailable.error.js'
import type { UserUuid } from '#src/modules/auth/users/entities/user.uuid.js'

@Injectable()
export class OneSignalClient {
  private readonly _client?: OneSignal.DefaultApi

  constructor (
    private readonly configService: ConfigService
  ) {
    try {
      const configuration = OneSignal.createConfiguration({
        restApiKey: this.configService.getOrThrow<string>('ONESIGNAL_API_KEY')
      })

      this._client = new OneSignal.DefaultApi(configuration)
    } catch (error) {
      captureException(error)
    }
  }

  private get client (): OneSignal.DefaultApi {
    if (!this._client) {
      throw new OneSignalUnavailableError('OneSignal client is not configured')
    } else {
      return this._client
    }
  }

  private getDefaulltAppId (): string {
    try {
      return this.configService.getOrThrow<string>('ONESIGNAL_APP_ID')
    } catch (error) {
      captureException(error)

      throw new OneSignalUnavailableError('OneSignal app id is not configured')
    }
  }

  public async sendPushNotification (
    name: string,
    headings: OneSignal.LanguageStringMap,
    contents: OneSignal.LanguageStringMap,
    userUuids: UserUuid[],
    data?: Record<string, unknown>
  ): Promise<void> {
    const notification = new OneSignal.Notification()

    notification.app_id = this.getDefaulltAppId()
    notification.name = name
    notification.headings = headings
    notification.contents = contents
    notification.target_channel = 'push'
    notification.include_aliases = {
      external_id: userUuids
    }
    notification.data = data

    await this.client.createNotification(notification)
  }
}
