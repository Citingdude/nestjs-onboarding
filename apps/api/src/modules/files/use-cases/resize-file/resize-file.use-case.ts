import { Injectable } from '@nestjs/common'
import { FileStorage } from '@wisemen/nestjs-file-storage'
import { DataSource } from 'typeorm'
import { SECONDS_PER_MINUTE } from '@wisemen/datewise'
import { transaction } from '@wisemen/nestjs-typeorm'
import { DomainEventEmitter } from '@wisemen/nestjs-domain-events'
import type { ResizeFileVariant } from '#src/modules/files/use-cases/resize-file/job/resize-file.job.js'
import { ImageFit, ImageFormat, type ImageResizeRequest, type ImageVariantRequest } from '#src/modules/image-resize/image-resize.request.js'
import { ImageResizeRequestBuilder, ImageVariantRequestBuilder } from '#src/modules/image-resize/image-resize.request.builder.js'
import { File } from '#src/modules/files/entities/file.entity.js'
import { ResizeFileRepository } from '#src/modules/files/use-cases/resize-file/resize-file.repository.js'
import { FileVariantCreatedEvent } from '#src/modules/files/use-cases/resize-file/file-variant.created.event.js'
import { ImageResizer } from '#src/modules/image-resize/image-resizer.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { FileStorageKeyFactory } from '#src/modules/files/modules/file-storage-key-factory/file-storage-key-factory.js'

@Injectable()
export class ResizeFileUseCase {
  private static readonly EXPIRES_IN_MINUTES = 10

  constructor (
    private readonly dataSource: DataSource,
    private readonly fileRepository: ResizeFileRepository,
    private readonly fileStorage: FileStorage,
    private readonly keyFactory: FileStorageKeyFactory,
    private readonly imageResizer: ImageResizer,
    private readonly eventEmitter: DomainEventEmitter
  ) { }

  async execute (fileUuid: FileUuid, variants: ResizeFileVariant[]): Promise<void> {
    const file = await this.fileRepository.getFile(fileUuid)

    if (file === null) {
      return
    }

    const newVariants = variants.filter(variant =>
      !file.variants.some(v => v.label === variant.label)
    )

    if (newVariants.length === 0) {
      return
    }

    const request = await this.createResizeRequest(file, newVariants)

    await this.imageResizer.resize(request)

    const events = newVariants.map(variant =>
      new FileVariantCreatedEvent(file.uuid, variant.label)
    )

    await transaction(this.dataSource, async () => {
      await this.fileRepository.updateFile(file.uuid, newVariants)
      await this.eventEmitter.emit(events)
    })
  }

  private async createResizeRequest (
    file: File,
    variants: ResizeFileVariant[]
  ): Promise<ImageResizeRequest> {
    const expiresInSeconds = ResizeFileUseCase.EXPIRES_IN_MINUTES * SECONDS_PER_MINUTE

    const downloadUrl = await this.fileStorage.createTemporaryDownloadUrl(
      file.key,
      file.name,
      file.mimeType,
      expiresInSeconds
    )

    const variantRequests = await this.createVariants(file, variants)

    return new ImageResizeRequestBuilder()
      .withDownloadUrl(downloadUrl)
      .withVariants(variantRequests)
      .build()
  }

  private async createVariants (
    file: File,
    variants: ResizeFileVariant[]
  ): Promise<ImageVariantRequest[]> {
    const expiresInSeconds = ResizeFileUseCase.EXPIRES_IN_MINUTES * SECONDS_PER_MINUTE

    return Promise.all(variants.map(async (variant) => {
      const fileStorageKey = this.keyFactory.createFromFile(file, variant.label)
      const uploadUrl = await this.fileStorage.createTemporaryUploadUrl(
        fileStorageKey,
        file.mimeType,
        expiresInSeconds,
        file.isPublic
      )

      return new ImageVariantRequestBuilder()
        .withWidth(variant.width)
        .withHeight(variant.height)
        .withFit(variant.fit ?? ImageFit.INSIDE)
        .withFormat(variant.format ?? ImageFormat.PNG)
        .withWithoutEnlargement (variant.withoutEnlargement)
        .withWithoutReduction (variant.withoutReduction)
        .withUploadUrl(uploadUrl)
        .build()
    }))
  }
}
