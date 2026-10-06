import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { captureException } from '@wisemen/opentelemetry'
import type { ImageResizeRequest } from '#src/modules/image-resize/image-resize.request.js'
import { ImageResizerUnavailableError } from '#src/modules/image-resize/image-resizer-unavailable.error.js'

interface ImageResizerConfig {
  url: string
  authToken?: string
}

@Injectable()
export class ImageResizer {
  private readonly _config?: ImageResizerConfig

  constructor (private readonly configService: ConfigService) {
    try {
      this._config = {
        url: this.configService.getOrThrow<string>('IMAGE_RESIZER_URL'),
        authToken: this.configService.get('IMAGE_RESIZER_AUTH_TOKEN')
      }
    } catch (error) {
      captureException(error)
    }
  }

  private get config (): ImageResizerConfig {
    if (this._config === undefined) {
      throw new ImageResizerUnavailableError('Image resizer client is not available')
    }

    return this._config
  }

  async resize (request: ImageResizeRequest): Promise<void> {
    const { url, authToken } = this.config

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authToken !== undefined ? { 'X-Auth-Token': authToken } : {}
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new ImageResizerUnavailableError(`Image resizer responded with status ${response.status}`)
    }
  }
}
