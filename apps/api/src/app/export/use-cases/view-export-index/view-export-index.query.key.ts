import { ApiProperty } from '@nestjs/swagger'
import { IsISO8601, IsUUID } from 'class-validator'
import { Export } from '#src/app/export/entities/export.entity.js'
import type { ExportUuid } from '#src/app/export/entities/export.uuid.js'

export class ViewExportIndexQueryKey {
  @ApiProperty({ format: 'datetime' })
  @IsISO8601({ strict: true })
  createdAt: string

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  uuid: ExportUuid

  static nextKey (entities: Export[]): ViewExportIndexQueryKey | null {
    if (entities.length == 0) {
      return null
    }

    const lastItem = entities.at(-1) as Export

    return this.from(lastItem)
  }

  static from (entity: Export): ViewExportIndexQueryKey {
    const key = new ViewExportIndexQueryKey()

    key.createdAt = entity.createdAt.toISOString()
    key.uuid = entity.uuid

    return key
  }
}
