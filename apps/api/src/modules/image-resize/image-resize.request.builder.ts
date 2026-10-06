import type { ImageFit, ImageFormat, ImageResizeRequest, ImageVariantRequest } from '#src/modules/image-resize/image-resize.request.js'

export class ImageVariantRequestBuilder {
  private command: ImageVariantRequest

  constructor () {
    this.command = {} as ImageVariantRequest
  }

  withUploadUrl (uploadUrl: string): this {
    this.command.uploadUrl = uploadUrl
    return this
  }

  withWidth (width?: number): this {
    this.command.width = width
    return this
  }

  withHeight (height?: number): this {
    this.command.height = height
    return this
  }

  withWithoutEnlargement (withoutEnlargement?: boolean): this {
    this.command.withoutEnlargement = withoutEnlargement
    return this
  }

  withWithoutReduction (withoutReduction?: boolean): this {
    this.command.withoutReduction = withoutReduction
    return this
  }

  withFit (fit: ImageFit): this {
    this.command.fit = fit
    return this
  }

  withFormat (format: ImageFormat): this {
    this.command.format = format
    return this
  }

  build (): ImageVariantRequest {
    return this.command
  }
}

export class ImageResizeRequestBuilder {
  private command: ImageResizeRequest

  constructor () {
    this.command = {} as ImageResizeRequest
  }

  withDownloadUrl (downloadUrl: string): this {
    this.command.downloadUrl = downloadUrl
    return this
  }

  withVariants (variants: ImageVariantRequest[]): this {
    this.command.variants = variants
    return this
  }

  build (): ImageResizeRequest {
    return this.command
  }
}
