import { BaseJob, PgBossJob } from '@wisemen/pgboss-nestjs-job'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import { QueueName } from '#src/modules/pgboss/enums/queue-name.enum.js'
import type { ImageFit, ImageFormat } from '#src/modules/image-resize/image-resize.request.js'

export interface ResizeFileVariant {
  label: string
  width?: number
  height?: number
  fit?: ImageFit
  format?: ImageFormat
  withoutEnlargement?: boolean
  withoutReduction?: boolean
}

export interface ResizeFileJobData {
  fileUuid: FileUuid
  variants: string
}

@PgBossJob(QueueName.SYSTEM)
export class ResizeFileJob extends BaseJob<ResizeFileJobData> {
  constructor (fileUuid: FileUuid, variants: ResizeFileVariant[]) {
    super({
      fileUuid,
      variants: JSON.stringify(variants)
    })
  }
}
