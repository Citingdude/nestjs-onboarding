import { InjectRepository, TypeOrmRepository } from '@wisemen/nestjs-typeorm'
import { File } from '#src/modules/files/entities/file.entity.js'
import type { FileUuid } from '#src/modules/files/entities/file.uuid.js'
import type { FileVariant } from '#src/modules/files/entities/file-variant.type.js'

export class ResizeFileRepository {
  constructor (
    @InjectRepository(File)
    private readonly fileRepository: TypeOrmRepository<File>
  ) { }

  async getFile (uuid: FileUuid): Promise<File | null> {
    return this.fileRepository.findOneBy({ uuid })
  }

  async updateFile (uuid: FileUuid, variants: FileVariant[]): Promise<void> {
    await this.fileRepository.query(
      `
      UPDATE file
      SET variants = (
        SELECT jsonb_agg(DISTINCT v)
        FROM (
          SELECT jsonb_array_elements(COALESCE(variants, '[]'::jsonb)) AS v
          UNION ALL
          SELECT jsonb_build_object('label', x.label)
          FROM jsonb_to_recordset($2::jsonb) AS x(label text)
        ) t
      )
      WHERE uuid = $1
    `,
      [uuid, JSON.stringify(variants)]
    )
  }
}
